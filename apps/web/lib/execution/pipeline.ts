import type { ExecutionProvider, SubmissionResult, TestCase } from "./types";
import { pistonProvider } from "./providers/piston";

function normalizeOutput(s: string): string {
  return s.trimEnd().replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

async function runAll(
  provider:  ExecutionProvider,
  code:      string,
  language:  string,
  testCases: TestCase[],
): Promise<SubmissionResult> {
  let totalRuntime = 0;
  let passedCount  = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    let result;

    try {
      result = await provider.execute({ code, language, stdin: tc.input ?? "" });
    } catch (err) {
      // Provider threw (network down, timeout, HTTP error) — rethrow so POST saves as pending
      throw err;
    }

    totalRuntime += result.runtimeMs;

    if (result.status === "compile_error") {
      return {
        status:      "compile_error",
        output:      result.stderr || "Compilation failed.",
        runtimeMs:   0,
        passedCount,
        totalCount:  testCases.length,
      };
    }

    if (result.status === "timeout") {
      return {
        status:  "timeout",
        output:  tc.is_hidden
          ? `Time limit exceeded on hidden test case ${i + 1}.`
          : result.stderr || `Time limit exceeded on test case ${i + 1}.`,
        runtimeMs:   totalRuntime,
        passedCount,
        totalCount:  testCases.length,
      };
    }

    if (result.status === "runtime_error") {
      return {
        status:  "runtime_error",
        output:  tc.is_hidden
          ? `Runtime error on hidden test case ${i + 1}.`
          : result.stderr || `Runtime error on test case ${i + 1}.`,
        runtimeMs:   totalRuntime,
        passedCount,
        totalCount:  testCases.length,
      };
    }

    // Output comparison — normalise line endings and trailing whitespace
    const expected = normalizeOutput(tc.expected_output ?? "");
    const actual   = normalizeOutput(result.stdout);

    if (expected && actual !== expected) {
      return {
        status:  "wrong_answer",
        output:  tc.is_hidden
          ? `Wrong answer on hidden test case ${i + 1}.`
          : `Wrong answer on test ${i + 1}.\n\nExpected:\n${expected}\n\nGot:\n${actual}`,
        runtimeMs:   totalRuntime,
        passedCount,
        totalCount:  testCases.length,
      };
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

export async function runSubmissionPipeline(
  code:      string,
  language:  string,
  testCases: TestCase[],
  provider:  ExecutionProvider = pistonProvider,
): Promise<SubmissionResult> {
  return runAll(provider, code, language, testCases);
}
