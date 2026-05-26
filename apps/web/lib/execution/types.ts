// Execution provider abstraction — swappable backend architecture.
// Current provider: Piston. Future: self-hosted VPS, Judge0, etc.

export type ExecStatus =
  | "accepted"
  | "wrong_answer"
  | "compile_error"
  | "runtime_error"
  | "timeout"
  | "pending";

export interface TestCase {
  input:           string;
  expected_output: string;
  is_hidden?:      boolean;
}

export interface ExecutionRequest {
  code:         string;
  language:     string;
  stdin:        string;
  timeLimitMs?: number;
}

export interface ExecutionResult {
  status:    ExecStatus;
  stdout:    string;
  stderr:    string;
  runtimeMs: number;
}

export interface SubmissionResult {
  status:      ExecStatus;
  output:      string;   // safe to show user — hidden test details masked
  runtimeMs:   number;
  passedCount: number;
  totalCount:  number;
}

// All execution backends implement this contract
export interface ExecutionProvider {
  readonly name: string;
  execute(req: ExecutionRequest): Promise<ExecutionResult>;
}
