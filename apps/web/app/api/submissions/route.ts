import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SEED_CHALLENGES } from "@/lib/challenges-seed";
import { pistonRun, PISTON_LANGS, type ExecStatus } from "@/lib/piston";
import { getRankFromXP } from "@upgradian/types";

export const maxDuration = 60;

// ─── Submission cooldown (anti-spam) ─────────────────────────────────────────
const COOLDOWN_MS = 5_000; // 5 seconds between graded submissions

interface TestCaseItem {
  input:           string;
  expected_output: string;
  is_hidden?:      boolean;
}

interface RunAllResult {
  status:    ExecStatus;
  output:    string; // safe to show user (no hidden test case leakage)
  runtimeMs: number;
  passedCount: number;
  totalCount:  number;
}

// ─── Run every test case through Piston ──────────────────────────────────────
async function runTestCases(
  code:      string,
  language:  string,
  testCases: TestCaseItem[],
): Promise<RunAllResult> {
  let totalRuntime = 0;
  let passedCount  = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    let r;

    try {
      r = await pistonRun(code, language, tc.input ?? "");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Execution service error.";
      console.error(`[submissions] Piston error on test ${i + 1}:`, err);
      return { status: "runtime_error", output: msg,
        runtimeMs: totalRuntime, passedCount, totalCount: testCases.length };
    }

    totalRuntime += r.runtimeMs;

    // ── Hard failures — stop immediately ──
    if (r.status === "compile_error") {
      // Always show compile output regardless of hidden status
      return { status: "compile_error", output: r.stderr || "Compilation failed.",
        runtimeMs: 0, passedCount, totalCount: testCases.length };
    }

    if (r.status === "time_limit") {
      const out = tc.is_hidden ? `Time limit exceeded on hidden test case ${i + 1}.` : r.stderr;
      return { status: "time_limit", output: out,
        runtimeMs: totalRuntime, passedCount, totalCount: testCases.length };
    }

    if (r.status === "runtime_error") {
      const out = tc.is_hidden
        ? `Runtime error on hidden test case ${i + 1}.`
        : (r.stderr || `Runtime error on test ${i + 1}.`);
      return { status: "runtime_error", output: out,
        runtimeMs: totalRuntime, passedCount, totalCount: testCases.length };
    }

    // ── Output comparison (status === "accepted" from Piston) ──
    const expected = (tc.expected_output ?? "").trim();
    const actual   = r.stdout.trim();

    if (expected && actual !== expected) {
      const out = tc.is_hidden
        ? `Wrong answer on hidden test case ${i + 1}.`
        : `Wrong answer on test ${i + 1}.\n\nExpected:\n${expected}\n\nGot:\n${actual}`;
      return { status: "wrong_answer", output: out,
        runtimeMs: totalRuntime, passedCount, totalCount: testCases.length };
    }

    passedCount++;
  }

  return {
    status:      "accepted",
    output:      "",
    runtimeMs:   Math.round(totalRuntime / Math.max(testCases.length, 1)),
    passedCount: testCases.length,
    totalCount:  testCases.length,
  };
}

// ─── POST /api/submissions ────────────────────────────────────────────────────
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ── Parse body ──
  let body: { challenge_id?: string; code?: string; language?: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { challenge_id, code, language } = body;

  // ── Input validation ──
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

  // ── Anti-spam cooldown (DB challenges only) ──
  const isSeed = challenge_id.startsWith("seed-");
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

  // ── Load challenge + ALL test cases (hidden included) ──
  const seed = isSeed ? SEED_CHALLENGES.find(c => c.id === challenge_id) : null;
  let challengeDbId: string | null = null;
  let xpReward = 50;
  let testCases: TestCaseItem[] = [];

  if (isSeed && seed) {
    xpReward  = seed.xp_reward ?? 50;
    testCases = (seed.test_cases ?? []) as TestCaseItem[];
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

    testCases = (tcs ?? []) as TestCaseItem[];
  } else {
    return NextResponse.json({ error: "Challenge not found." }, { status: 404 });
  }

  if (testCases.length === 0) {
    testCases = [{ input: "", expected_output: "", is_hidden: false }];
  }

  // ── Execute all test cases via Piston ──
  const exec = await runTestCases(code, language, testCases);

  // XP only for a clean accepted run
  const xpEarned = exec.status === "accepted" ? xpReward : 0;

  // ── Persist submission (DB challenges only) ──
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
        memory_mb:    null, // Piston does not expose memory usage
        xp_earned:    xpEarned,
      })
      .select("id")
      .single();

    if (saveErr) console.error("[submissions] Save error:", saveErr);
    submissionId = saved?.id;
  }

  // ── Profile updates on accepted + XP earned ──
  if (exec.status === "accepted" && xpEarned > 0) {
    // ── First-solve gate (prevents XP farming) ──
    let isFirstSolve = false;

    if (isSeed) {
      const { data: p } = await supabase
        .from("profiles")
        .select("solved_seed_ids")
        .eq("id", user.id)
        .single();
      isFirstSolve = !(p?.solved_seed_ids ?? []).includes(challenge_id);
    } else if (challengeDbId) {
      // Count accepted submissions for this challenge; we just inserted one so threshold is 1
      const { count } = await supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("user_id",      user.id)
        .eq("challenge_id", challengeDbId)
        .eq("status",       "accepted");
      isFirstSolve = (count ?? 0) <= 1;
    }

    if (!isFirstSolve) {
      // Challenge already solved — no XP awarded; return early from profile update
      return NextResponse.json({
        id:           submissionId,
        status:       exec.status,
        output:       exec.output,
        runtime:      exec.runtimeMs,
        memory:       null,
        xp_earned:    0,
        passed:       exec.passedCount,
        total:        exec.totalCount,
      });
    }

    // ── Read profile for rank + streak computation ──
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

      // ── Leaderboard recalculation: always recompute rank from new XP ──
      const newRank = getRankFromXP(newXP);

      interface ProfileUpdate {
        total_xp:         number;
        rank:             string;
        streak_days:      number;
        last_streak_date: string;
        last_active_at:   string;
        challenges_solved?: number;
        solved_seed_ids?:   string[];
      }

      const update: ProfileUpdate = {
        total_xp:         newXP,
        rank:             newRank,
        streak_days:      newStreak,
        last_streak_date: todayUTC,
        last_active_at:   new Date().toISOString(),
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
