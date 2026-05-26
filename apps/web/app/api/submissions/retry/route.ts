import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PISTON_LANGS } from "@/lib/piston";
import { runSubmissionPipeline } from "@/lib/execution/pipeline";
import type { TestCase } from "@/lib/execution/types";
import { getRankFromXP } from "@upgradian/types";

export const maxDuration = 60;

// POST /api/submissions/retry — re-run a specific pending submission by ID
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { submission_id?: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { submission_id } = body;
  if (!submission_id) {
    return NextResponse.json({ error: "submission_id is required." }, { status: 400 });
  }

  // Load the pending submission — must belong to this user
  const { data: sub, error: subErr } = await supabase
    .from("submissions")
    .select("id,code,language,challenge_id,status")
    .eq("id",      submission_id)
    .eq("user_id", user.id)
    .eq("status",  "pending")
    .maybeSingle();

  if (subErr || !sub) {
    return NextResponse.json({ error: "Pending submission not found." }, { status: 404 });
  }

  if (!(sub.language in PISTON_LANGS)) {
    return NextResponse.json({ error: "Unsupported language." }, { status: 400 });
  }

  // Load test cases
  const { data: tcs } = await supabase
    .from("test_cases")
    .select("input,expected_output,is_hidden")
    .eq("challenge_id", sub.challenge_id)
    .order("order_index");

  const testCases: TestCase[] = (tcs ?? []).length > 0
    ? (tcs as TestCase[])
    : [{ input: "", expected_output: "", is_hidden: false }];

  // Load XP reward
  const { data: ch } = await supabase
    .from("challenges")
    .select("xp_reward")
    .eq("id", sub.challenge_id)
    .maybeSingle();

  const xpReward = ch?.xp_reward ?? 50;

  // Execute
  let exec;
  try {
    exec = await runSubmissionPipeline(sub.code, sub.language, testCases);
  } catch {
    return NextResponse.json({
      status: "pending",
      output: "Execution service still unavailable. Please try again shortly.",
      runtime: null, memory: null, xp_earned: 0, passed: 0, total: testCases.length,
    });
  }

  const xpEarned = exec.status === "accepted" ? xpReward : 0;

  // Update the submission row
  await supabase
    .from("submissions")
    .update({
      status:     exec.status,
      runtime_ms: exec.runtimeMs,
      xp_earned:  xpEarned,
    })
    .eq("id", sub.id);

  // XP + profile update on first accepted solve
  if (exec.status === "accepted" && xpEarned > 0) {
    const { count } = await supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("user_id",      user.id)
      .eq("challenge_id", sub.challenge_id)
      .eq("status",       "accepted");

    if ((count ?? 0) <= 1) {
      try {
        const { data: prof } = await supabase
          .from("profiles")
          .select("total_xp,rank,streak_days,last_streak_date,challenges_solved")
          .eq("id", user.id)
          .single();

        const todayUTC  = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
        const lastDate  = prof?.last_streak_date ?? null;
        const newXP     = Number(prof?.total_xp ?? 0) + xpEarned;
        const newStreak =
          !lastDate || lastDate < yesterday ? 1 :
          lastDate === yesterday            ? (prof?.streak_days ?? 0) + 1 :
                                              prof?.streak_days ?? 1;

        await supabase.from("profiles").update({
          total_xp:         newXP,
          rank:             getRankFromXP(newXP),
          streak_days:      newStreak,
          last_streak_date: todayUTC,
          last_active_at:   new Date().toISOString(),
          challenges_solved: (prof?.challenges_solved ?? 0) + 1,
        }).eq("id", user.id);
      } catch (err) {
        console.error("[submissions/retry] profile update error:", err);
      }
    }
  }

  return NextResponse.json({
    id:        sub.id,
    status:    exec.status,
    output:    exec.output,
    runtime:   exec.runtimeMs,
    memory:    null,
    xp_earned: xpEarned,
    passed:    exec.passedCount,
    total:     exec.totalCount,
  });
}
