import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const JUDGE0_URL = process.env.JUDGE0_URL ?? "https://judge0-ce.p.rapidapi.com";
const JUDGE0_KEY = process.env.JUDGE0_API_KEY ?? "";

const JUDGE0_LANG: Record<string, number> = {
  python:     71,
  javascript: 63,
  typescript: 74,
  java:       62,
  cpp:        54,
  c:          50,
  go:         60,
  rust:       73,
};

async function runOnJudge0(code: string, languageId: number, stdin: string): Promise<{
  status: { description: string };
  stdout: string | null;
  stderr: string | null;
  time: string | null;
  memory: number | null;
}> {
  const createRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": JUDGE0_KEY,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
    body: JSON.stringify({ source_code: code, language_id: languageId, stdin }),
  });
  return createRes.json();
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challenge_id, code, language } = await request.json();
  if (!challenge_id || !code || !language) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id,xp_reward,test_cases")
    .eq("id", challenge_id)
    .single();

  if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  const langId = JUDGE0_LANG[language];
  if (!langId) return NextResponse.json({ error: "Unsupported language" }, { status: 400 });

  const testCases = (challenge.test_cases ?? []).filter((tc: Record<string, unknown>) => !tc.is_hidden);
  let allPassed = true;
  let lastOutput = "";
  let totalRuntime = 0;
  let totalMemory = 0;

  for (const tc of testCases) {
    const result = await runOnJudge0(code, langId, tc.input ?? "");
    const expected = (tc.expected_output ?? "").trim();
    const actual   = (result.stdout ?? "").trim();
    if (result.status.description !== "Accepted" || actual !== expected) {
      allPassed = false;
      lastOutput = result.stderr ?? result.stdout ?? "Runtime Error";
      break;
    }
    lastOutput = actual;
    totalRuntime += parseFloat(result.time ?? "0") * 1000;
    totalMemory  += (result.memory ?? 0) / 1024;
  }

  const finalStatus = allPassed ? "accepted" : "wrong_answer";
  const xpEarned   = allPassed ? challenge.xp_reward : 0;
  const runtimeMs  = Math.round(totalRuntime / Math.max(testCases.length, 1));
  const memoryMb   = totalMemory / Math.max(testCases.length, 1);

  const { data: submission } = await supabase
    .from("submissions")
    .insert({
      user_id:      user.id,
      challenge_id: challenge.id,
      code,
      language,
      status:       finalStatus,
      runtime_ms:   runtimeMs,
      memory_mb:    memoryMb,
      xp_earned:    xpEarned,
    })
    .select()
    .single();

  if (allPassed) {
    await supabase.rpc("add_xp_to_profile", { p_user_id: user.id, p_xp: xpEarned });
  }

  return NextResponse.json({
    id:        submission?.id,
    status:    finalStatus,
    output:    lastOutput,
    runtime:   runtimeMs,
    memory:    parseFloat(memoryMb.toFixed(1)),
    xp_earned: xpEarned,
  });
}
