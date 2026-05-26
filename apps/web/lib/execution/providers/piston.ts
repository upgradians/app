import type { ExecutionProvider, ExecutionRequest, ExecutionResult } from "../types";
import { pistonRun } from "../../piston";

// Wraps the public Piston API as an ExecutionProvider.
// Normalises Piston's internal "time_limit" status to the canonical "timeout".
class PistonProvider implements ExecutionProvider {
  readonly name = "piston";

  async execute(req: ExecutionRequest): Promise<ExecutionResult> {
    const r = await pistonRun(req.code, req.language, req.stdin);
    return {
      status:    r.status === "time_limit" ? "timeout" : r.status,
      stdout:    r.stdout,
      stderr:    r.stderr,
      runtimeMs: r.runtimeMs,
    };
  }
}

export const pistonProvider = new PistonProvider();
