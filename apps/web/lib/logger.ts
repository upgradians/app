type Level = "info" | "warn" | "error";

function emit(level: Level, scope: string, message: string, data?: Record<string, unknown>) {
  const entry = {
    ts:      new Date().toISOString(),
    level,
    scope,
    message,
    ...(data ?? {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info:  (scope: string, msg: string, data?: Record<string, unknown>) => emit("info",  scope, msg, data),
  warn:  (scope: string, msg: string, data?: Record<string, unknown>) => emit("warn",  scope, msg, data),
  error: (scope: string, msg: string, data?: Record<string, unknown>) => emit("error", scope, msg, data),
};
