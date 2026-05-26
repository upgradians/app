// ─── Piston API wrapper ───────────────────────────────────────────────────────
// Docs: https://github.com/engineer-man/piston
// Public endpoint: https://emkc.org/api/v2/piston
// Frontend must NEVER call Piston directly — route everything through /api/code/execute

const PISTON_BASE = "https://emkc.org/api/v2/piston";

// ─── Language map ─────────────────────────────────────────────────────────────
export interface PistonLangCfg {
  pistonLang: string; // language name Piston expects
  version:    string; // "*" = latest available
  filename:   string; // filename Piston uses (matters for Java/C#)
}

// These IDs must match SUPPORTED_LANGUAGES in @upgradian/types exactly
export const PISTON_LANGS: Record<string, PistonLangCfg> = {
  python:     { pistonLang: "python",     version: "*", filename: "solution.py"   },
  javascript: { pistonLang: "javascript", version: "*", filename: "solution.js"   },
  typescript: { pistonLang: "typescript", version: "*", filename: "solution.ts"   },
  java:       { pistonLang: "java",       version: "*", filename: "Solution.java" },
  c:          { pistonLang: "c",          version: "*", filename: "solution.c"    },
  cpp:        { pistonLang: "c++",        version: "*", filename: "solution.cpp"  },
  go:         { pistonLang: "go",         version: "*", filename: "solution.go"   },
  rust:       { pistonLang: "rust",       version: "*", filename: "solution.rs"   },
  kotlin:     { pistonLang: "kotlin",     version: "*", filename: "solution.kt"   },
  csharp:     { pistonLang: "csharp",     version: "*", filename: "Solution.cs"   },
};

export type ExecStatus =
  | "accepted"
  | "wrong_answer"
  | "compile_error"
  | "runtime_error"
  | "time_limit";

export interface ExecResult {
  status:    ExecStatus;
  stdout:    string;
  stderr:    string;
  runtimeMs: number;
}

// ─── Internal Piston response shape ──────────────────────────────────────────
interface PistonRunOutput {
  stdout: string;
  stderr: string;
  output: string;
  code:   number | null;
  signal: string | null;
}

interface PistonResponse {
  language: string;
  version:  string;
  compile?: PistonRunOutput | null;
  run:      PistonRunOutput;
}

// ─── Core execute function ────────────────────────────────────────────────────
export async function pistonRun(
  code:     string,
  language: string,
  stdin:    string,
): Promise<ExecResult> {
  const cfg = PISTON_LANGS[language];
  if (!cfg) throw new Error(`Unsupported language: "${language}"`);

  const t0  = Date.now();
  const res = await fetch(`${PISTON_BASE}/execute`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language:             cfg.pistonLang,
      version:              cfg.version,
      files:                [{ name: cfg.filename, content: code }],
      stdin,
      compile_timeout:      15_000, // ms — generous for Java/Kotlin/Rust
      run_timeout:          5_000,  // ms — 5s per test case
      compile_memory_limit: -1,     // no extra limit (Piston enforces its own)
      run_memory_limit:     -1,
    }),
    signal: AbortSignal.timeout(35_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Piston API HTTP ${res.status}: ${body.slice(0, 300)}`);
  }

  const data: PistonResponse = await res.json();
  const runtimeMs = Date.now() - t0;

  // Compile error — present only for compiled languages (Java, C, C++, Rust, Kotlin, C#, Go)
  if (data.compile && data.compile.code !== 0) {
    const stderr = (data.compile.stderr || data.compile.stdout || "Compilation failed.").trim();
    return { status: "compile_error", stdout: "", stderr, runtimeMs };
  }

  const run = data.run;

  // Time limit — Piston sends SIGKILL when run_timeout is exceeded
  if (run.signal === "SIGKILL" || run.signal === "SIGALRM") {
    return {
      status: "time_limit",
      stdout: run.stdout ?? "",
      stderr: `Process killed after 5s (${run.signal}).`,
      runtimeMs,
    };
  }

  // Runtime error — non-zero exit code
  if (run.code !== 0) {
    const stderr = (run.stderr || run.output || `Process exited with code ${run.code}.`).trim();
    return { status: "runtime_error", stdout: run.stdout ?? "", stderr, runtimeMs };
  }

  // Success — return stdout for output comparison; caller checks expected
  return {
    status:    "accepted",
    stdout:    (run.stdout ?? "").trimEnd(),
    stderr:    run.stderr ?? "",
    runtimeMs,
  };
}
