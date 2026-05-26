import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SEED_CHALLENGES } from "@/lib/challenges-seed";

// Extend Vercel function timeout to 60s (requires Pro plan; ignored on hobby)
export const maxDuration = 60;

// ─── Configuration ────────────────────────────────────────────────────────────
// Support both JUDGE0_API_URL (user-facing name) and JUDGE0_URL (legacy)
const JUDGE0_BASE = (process.env.JUDGE0_API_URL ?? process.env.JUDGE0_URL ?? "").replace(/\/$/, "");
const JUDGE0_KEY  = process.env.JUDGE0_API_KEY ?? "";
const IS_RAPID    = JUDGE0_BASE.includes("rapidapi.com");

// ─── Language Map ─────────────────────────────────────────────────────────────
const JUDGE0_LANG: Record<string, number> = {
  python:     71,
  javascript: 63,
  typescript: 74,
  java:       62,
  cpp:        54,
  c:          50,
  go:         60,
  rust:       73,
  csharp:     51,
  kotlin:     78,
  php:        68,
  ruby:       72,
  swift:      83,
};

// ─── Judge0 Status IDs ────────────────────────────────────────────────────────
// 1=In Queue  2=Processing  3=Accepted  4=Wrong Answer  5=TLE
// 6=Compile Error  7-14=Runtime Error variants
type ExecStatus = "accepted" | "wrong_answer" | "time_limit" | "compile_error" | "runtime_error";

function mapJ0Status(id: number): ExecStatus | "pending" {
  if (id <= 2) return "pending";
  if (id === 3) return "accepted";
  if (id === 4) return "wrong_answer";
  if (id === 5) return "time_limit";
  if (id === 6) return "compile_error";
  return "runtime_error"; // 7–14
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface J0Result {
  token?: string;
  status: { id: number; description: string };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
  message?: string | null;
}

interface TestCaseItem {
  input: string;
  expected_output: string;
  is_hidden?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (IS_RAPID) {
    h["X-RapidAPI-Key"]  = JUDGE0_KEY;
    h["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com";
  } else {
    h["X-Auth-Token"] = JUDGE0_KEY;
  }
  return h;
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ─── Judge0 Submit (async, no wait) ──────────────────────────────────────────
async function j0Submit(code: string, langId: number, stdin: string): Promise<string> {
  const res = await fetch(`${JUDGE0_BASE}/submissions?base64_encoded=false`, {
    method:  "POST",
    headers: getHeaders(),
    body:    JSON.stringify({ source_code: code, language_id: langId, stdin }),
    signal:  AbortSignal.timeout(15_000),
  });

  if (res.status === 429) {
    throw new Error("Judge0 rate limit exceeded — please wait a moment and retry.");
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Judge0 submit HTTP ${res.status}: ${body.slice(0, 300)}`);
  }

  const data: J0Result = await res.json();
  if (!data.token) throw new Error("Judge0 returned no submission token");
  return data.token;
}

// ─── Judge0 Poll ──────────────────────────────────────────────────────────────
async function j0Poll(token: string): Promise<J0Result> {
  const fields = "status,stdout,stderr,compile_output,time,memory,message";
  for (let i = 0; i < 24; i++) {
    await sleep(Math.min(800 + i * 400, 3000));
    try {
      const res = await fetch(
        `${JUDGE0_BASE}/submissions/${token}?base64_encoded=false&fields=${fields}`,
        { headers: getHeaders(), signal: AbortSignal.timeout(10_000) },
      );
      if (!res.ok) continue; // transient error — keep polling
      const data: J0Result = await res.json();
      if (mapJ0Status(data.status.id) !== "pending") return data;
    } catch {
      // network hiccup — continue polling
    }
  }
  throw new Error("Execution timed out waiting for Judge0 result (>30s)");
}

// ─── Submit + Poll with Retry ─────────────────────────────────────────────────
async function j0Run(code: string, langId: number, stdin: string, attempt = 0): Promise<J0Result> {
  try {
    const token = await j0Submit(code, langId, stdin);
    return await j0Poll(token);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Don't retry rate-limit or client errors (4xx)
    if (msg.includes("rate limit") || /HTTP 4\d\d/.test(msg)) throw err;
    if (attempt < 2) {
      console.warn(`[submissions] Judge0 attempt ${attempt + 1} failed: ${msg}`);
      await sleep(1500 * (attempt + 1));
      return j0Run(code, langId, stdin, attempt + 1);
    }
    throw err;
  }
}

// ─── Run All Test Cases ───────────────────────────────────────────────────────
interface RunAllResult {
  status:   ExecStatus;
  output:   string;
  runtimeMs: number;
  memoryMb:  number;
}

async function runAllTestCases(
  code: string, langId: number, testCases: TestCaseItem[]
): Promise<RunAllResult> {
  let totalRuntime = 0;
  let totalMemory  = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    let r: J0Result;

    try {
      r = await j0Run(code, langId, tc.input ?? "");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Execution service error.";
      console.error(`[submissions] Test case ${i + 1} execution error:`, err);
      return { status: "runtime_error", output: msg, runtimeMs: 0, memoryMb: 0 };
    }

    const sid = r.status.id;
    totalRuntime += parseFloat(r.time   ?? "0") * 1000;
    totalMemory  += (r.memory ?? 0) / 1024;

    // Compile error — stop immediately, show full output
    if (sid === 6) {
      const out = (r.compile_output ?? "").trim() || "Compilation failed.";
      console.info(`[submissions] Compile error on test ${i + 1}`);
      return { status: "compile_error", output: out, runtimeMs: 0, memoryMb: 0 };
    }

    // Time Limit Exceeded
    if (sid === 5) {
      const out = tc.is_hidden
        ? `Time limit exceeded on hidden test case ${i + 1}.`
        : "Time limit exceeded.";
      return { status: "time_limit", output: out,
        runtimeMs: Math.round(totalRuntime), memoryMb: totalMemory };
    }

    // Runtime errors (7–14)
    if (sid >= 7) {
      const out = tc.is_hidden
        ? `Runtime error on hidden test case ${i + 1}.`
        : ((r.stderr ?? r.message ?? "").trim() || `Runtime error (${r.status.description}).`);
      return { status: "runtime_error", output: out,
        runtimeMs: Math.round(totalRuntime), memoryMb: totalMemory };
    }

    // Wrong answer from executor (sid === 4)
    if (sid === 4) {
      const out = tc.is_hidden
        ? `Wrong answer on hidden test case ${i + 1}.`
        : (r.stdout ?? "Wrong answer.");
      return { status: "wrong_answer", output: out,
        runtimeMs: Math.round(totalRuntime), memoryMb: totalMemory };
    }

    // sid === 3 (Accepted by executor) — verify expected output
    if (tc.expected_output) {
      const expected = tc.expected_output.trim();
      const actual   = (r.stdout ?? "").trim();
      if (actual !== expected) {
        const out = tc.is_hidden
          ? `Wrong answer on hidden test case ${i + 1}.`
          : `Expected:\n${expected}\n\nGot:\n${actual}`;
        return { status: "wrong_answer", output: out,
          runtimeMs: Math.round(totalRuntime), memoryMb: totalMemory };
      }
    }

    // This test case passed — continue
  }

  // All test cases passed
  const n = Math.max(testCases.length, 1);
  return {
    status:    "accepted",
    output:    "",
    runtimeMs: Math.round(totalRuntime / n),
    memoryMb:  totalMemory / n,
  };
}

// ─── POST /api/submissions ────────────────────────────────────────────────────
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Parse body
  let body: { challenge_id?: string; code?: string; language?: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { challenge_id, code, language } = body;
  if (!challenge_id || !code || !language) {
    return NextResponse.json({ error: "Missing required fields: challenge_id, code, language" }, { status: 400 });
  }

  // Validate language
  const langId = JUDGE0_LANG[language];
  if (!langId) {
    return NextResponse.json({
      error: `Unsupported language: "${language}". Supported: ${Object.keys(JUDGE0_LANG).join(", ")}`,
    }, { status: 400 });
  }

  // Validate Judge0 is configured
  if (!JUDGE0_BASE || !JUDGE0_KEY) {
    console.error("[submissions] JUDGE0_API_URL or JUDGE0_API_KEY not configured");
    return NextResponse.json(
      { error: "Code execution service is not configured. Contact the administrator." },
      { status: 503 },
    );
  }

  // ── Load challenge + ALL test cases (including hidden) ──
  const isSeed = challenge_id.startsWith("seed-");
  const seed   = isSeed ? SEED_CHALLENGES.find(c => c.id === challenge_id) : null;

  let challengeDbId: string | null = null;
  let xpReward  = 50;
  let testCases: TestCaseItem[] = [];

  if (isSeed && seed) {
    xpReward  = seed.xp_reward ?? 50;
    testCases = (seed.test_cases ?? []) as TestCaseItem[];
  } else if (!isSeed) {
    const { data: challenge, error: chErr } = await supabase
      .from("challenges")
      .select("id,xp_reward")
      .eq("id", challenge_id)
      .single();

    if (chErr || !challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    challengeDbId = challenge.id;
    xpReward      = challenge.xp_reward ?? 50;

    const { data: tcs } = await supabase
      .from("test_cases")
      .select("input,expected_output,is_hidden")
      .eq("challenge_id", challenge.id)
      .order("order_index");

    testCases = (tcs ?? []) as TestCaseItem[];
  } else {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  // Ensure at least one test case
  if (testCases.length === 0) {
    testCases = [{ input: "", expected_output: "", is_hidden: false }];
  }

  // ── Execute against all test cases ──
  const exec = await runAllTestCases(code, langId, testCases);
  const xpEarned = exec.status === "accepted" ? xpReward : 0;
  const memoryMb = parseFloat(exec.memoryMb.toFixed(2));

  // ── Persist submission to DB (non-seed challenges) ──
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
        memory_mb:    memoryMb,
        xp_earned:    xpEarned,
      })
      .select("id")
      .single();

    if (saveErr) {
      console.error("[submissions] Failed to save submission:", saveErr);
    }
    submissionId = saved?.id;
  }

  // ── XP + Streak + Profile updates on first-time accepted ──
  if (exec.status === "accepted" && xpEarned > 0) {
    let isFirstSolve = false;

    if (isSeed) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("solved_seed_ids")
        .eq("id", user.id)
        .single();
      const existing: string[] = prof?.solved_seed_ids ?? [];
      isFirstSolve = !existing.includes(challenge_id);
    } else if (challengeDbId) {
      const { count } = await supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("user_id",      user.id)
        .eq("challenge_id", challengeDbId)
        .eq("status",       "accepted");
      isFirstSolve = (count ?? 0) <= 1;
    }

    try {
      await supabase.rpc("add_xp_to_profile", { p_user_id: user.id, p_xp: xpEarned });
    } catch (err) {
      console.error("[submissions] add_xp_to_profile RPC error:", err);
    }

    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("streak_days,last_streak_date,challenges_solved,solved_seed_ids")
        .eq("id", user.id)
        .single();

      const todayUTC  = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
      const lastDate  = prof?.last_streak_date ?? null;

      const newStreak =
        !lastDate || lastDate < yesterday ? 1 :
        lastDate === yesterday            ? (prof?.streak_days ?? 0) + 1 :
                                            prof?.streak_days ?? 1;

      interface ProfileUpdate {
        streak_days:      number;
        last_streak_date: string;
        last_active_at:   string;
        challenges_solved?: number;
        solved_seed_ids?:   string[];
      }

      const update: ProfileUpdate = {
        streak_days:      newStreak,
        last_streak_date: todayUTC,
        last_active_at:   new Date().toISOString(),
      };

      if (isFirstSolve) {
        update.challenges_solved = (prof?.challenges_solved ?? 0) + 1;
        if (isSeed) {
          update.solved_seed_ids = [...(prof?.solved_seed_ids ?? []), challenge_id];
        }
      }

      await supabase.from("profiles").update(update).eq("id", user.id);
    } catch (err) {
      console.error("[submissions] Profile update error:", err);
    }
  }

  return NextResponse.json({
    id:        submissionId,
    status:    exec.status,
    output:    exec.output,
    runtime:   exec.runtimeMs,
    memory:    parseFloat(exec.memoryMb.toFixed(1)),
    xp_earned: xpEarned,
  });
}
