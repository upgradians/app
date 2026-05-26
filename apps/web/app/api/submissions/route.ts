import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SEED_CHALLENGES } from "@/lib/challenges-seed";
import { PISTON_LANGS } from "@/lib/piston";
import { preValidateCode } from "@/lib/execution/validate";
import { runSubmissionPipeline } from "@/lib/execution/pipeline";
import type { TestCase } from "@/lib/execution/types";
import { getRankFromXP } from "@upgradian/types";

export const maxDuration = 60;

const COOLDOWN_MS = 5_000;

// ─── POST /api/submissions ────────────────────────────────────────────────────
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: { challenge_id?: string; code?: string; language?: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { challenge_id, code, language } = body;

  // ── Input validation ──────────────────────────────────────────────────────
  if (!challenge_id) {
    return NextResponse.json({ error: "challenge_id is required." }, { status: 400 });
  }
  if (!code?.trim()) {
    return NextResponse.json({ error: "Code cannot be empty." }, { status: 400 });
  }
  if (!language) {
    return NextResponse.json({ error: "Language is required." }, { status: 400 });
  }
  if (!(language in PISTON_LANGS)) {
    return NextResponse.json({
      error: `Unsupported language "${language}". Supported: ${Object.keys(PISTON_LANGS).join(", ")}`,
    }, { status: 400 });
  }

  // ── Deterministic pre-validation (7-stage) ────────────────────────────────
  const isSeed      = challenge_id.startsWith("seed-");
  const seedForPreV = isSeed ? SEED_CHALLENGES.find(c => c.id === challenge_id) : null;
  const preErr      = preValidateCode(code, language, seedForPreV?.starter_code ?? null);
  if (preErr) {
    return NextResponse.json({ error: preErr }, { status: 422 });
  }

  // ── Anti-spam cooldown (DB challenges only) ───────────────────────────────
  if (!isSeed) {
    const { data: recent } = await supabase
      .from("submissions")
      .select("submitted_at")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recent?.submitted_at) {
      const elapsed = Date.now() - new Date(recent.submitted_at).getTime();
      if (elapsed < COOLDOWN_MS) {
        const wait = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          { error: `Please wait ${wait}s before submitting again.` },
          { status: 429 },
        );
      }
    }
  }

  // ── Load challenge + ALL test cases (hidden included — never sent to client) ──
  const seed = isSeed ? SEED_CHALLENGES.find(c => c.id === challenge_id) : null;
  let challengeDbId: string | null = null;
  let xpReward = 50;
  let testCases: TestCase[] = [];

  if (isSeed && seed) {
    xpReward  = seed.xp_reward ?? 50;
    testCases = (seed.test_cases ?? []) as TestCase[];
  } else if (!isSeed) {
    const { data: ch, error: chErr } = await supabase
      .from("challenges")
      .select("id,xp_reward")
      .eq("id", challenge_id)
      .single();

    if (chErr || !ch) {
      return NextResponse.json({ error: "Challenge not found." }, { status: 404 });
    }

    challengeDbId = ch.id;
    xpReward      = ch.xp_reward ?? 50;

    const { data: tcs } = await supabase
      .from("test_cases")
      .select("input,expected_output,is_hidden")
      .eq("challenge_id", ch.id)
      .order("order_index");

    testCases = (tcs ?? []) as TestCase[];
  } else {
    return NextResponse.json({ error: "Challenge not found." }, { status: 404 });
  }

  if (testCases.length === 0) {
    testCases = [{ input: "", expected_output: "", is_hidden: false }];
  }

  // ── Execute all test cases via provider pipeline ───────────────────────────
  let exec;
  try {
    exec = await runSubmissionPipeline(code, language, testCases);
  } catch (err) {
    console.error("[submissions] Execution provider unavailable:", err);
    let pendingId: string | undefined;
    if (!isSeed && challengeDbId) {
      const { data: saved } = await supabase
        .from("submissions")
        .insert({
          user_id: user.id, challenge_id: challengeDbId,
          code, language, status: "pending",
          runtime_ms: null, memory_mb: null, xp_earned: 0,
        })
        .select("id").single();
      pendingId = saved?.id;
    }
    return NextResponse.json({
      id:        pendingId,
      status:    "pending",
      output:    "The execution service is temporarily unavailable. Your submission has been saved. Please try again in a few minutes.",
      runtime:   null,
      memory:    null,
      xp_earned: 0,
      passed:    0,
      total:     testCases.length,
    });
  }

  // ── XP: only for clean accepted run ──────────────────────────────────────
  const xpEarned = exec.status === "accepted" ? xpReward : 0;

  // ── Persist submission (DB challenges only) ───────────────────────────────
  let submissionId: string | undefined;
  if (!isSeed && challengeDbId) {
    const { data: saved, error: saveErr } = await supabase
      .from("submissions")
      .insert({
        user_id:      user.id,
        challenge_id: challengeDbId,
        code,
        language,
        status:       exec.status,
        runtime_ms:   exec.runtimeMs,
        memory_mb:    null,
        xp_earned:    xpEarned,
      })
      .select("id")
      .single();

    if (saveErr) console.error("[submissions] Save error:", saveErr);
    submissionId = saved?.id;
  }

  // ── Profile updates: accepted + XP earned ─────────────────────────────────
  if (exec.status === "accepted" && xpEarned > 0) {

    // First-solve gate — prevents duplicate XP farming
    let isFirstSolve = false;
    if (isSeed) {
      const { data: p } = await supabase
        .from("profiles")
        .select("solved_seed_ids")
        .eq("id", user.id)
        .single();
      isFirstSolve = !(p?.solved_seed_ids ?? []).includes(challenge_id);
    } else if (challengeDbId) {
      const { count } = await supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("user_id",      user.id)
        .eq("challenge_id", challengeDbId)
        .eq("status",       "accepted");
      isFirstSolve = (count ?? 0) <= 1;
    }

    if (!isFirstSolve) {
      return NextResponse.json({
        id: submissionId, status: exec.status,
        output: exec.output, runtime: exec.runtimeMs, memory: null,
        xp_earned: 0, passed: exec.passedCount, total: exec.totalCount,
      });
    }

    // Update profile: XP, rank, streak, challenges_solved
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("total_xp,rank,streak_days,last_streak_date,challenges_solved,solved_seed_ids")
        .eq("id", user.id)
        .single();

      const todayUTC  = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
      const lastDate  = prof?.last_streak_date ?? null;
      const lastXP    = Number(prof?.total_xp ?? 0);
      const newXP     = lastXP + xpEarned;

      const newStreak =
        !lastDate || lastDate < yesterday ? 1 :
        lastDate === yesterday            ? (prof?.streak_days ?? 0) + 1 :
                                            prof?.streak_days ?? 1;

      const newRank = getRankFromXP(newXP);

      interface ProfileUpdate {
        total_xp:          number;
        rank:              string;
        streak_days:       number;
        last_streak_date:  string;
        last_active_at:    string;
        challenges_solved?: number;
        solved_seed_ids?:   string[];
      }

      const update: ProfileUpdate = {
        total_xp:          newXP,
        rank:              newRank,
        streak_days:       newStreak,
        last_streak_date:  todayUTC,
        last_active_at:    new Date().toISOString(),
        challenges_solved: (prof?.challenges_solved ?? 0) + 1,
      };

      if (isSeed) {
        update.solved_seed_ids = [...(prof?.solved_seed_ids ?? []), challenge_id];
      }

      const { error: updErr } = await supabase
        .from("profiles")
        .update(update)
        .eq("id", user.id);

      if (updErr) console.error("[submissions] Profile update error:", updErr);
    } catch (err) {
      console.error("[submissions] Profile block error:", err);
    }
  }

  return NextResponse.json({
    id:        submissionId,
    status:    exec.status,
    output:    exec.output,
    runtime:   exec.runtimeMs,
    memory:    null,
    xp_earned: xpEarned,
    passed:    exec.passedCount,
    total:     exec.totalCount,
  });
}
