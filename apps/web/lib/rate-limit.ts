// In-memory sliding window rate limiter (best-effort; resets on cold start).
// For multi-instance / persistent limits, upgrade to a Redis-backed solution.

interface Window { count: number; resetAt: number }

const store = new Map<string, Window>();

// Prune expired entries every 5 minutes to avoid memory leaks
let lastPrune = Date.now();
function maybePrune() {
  const now = Date.now();
  if (now - lastPrune < 300_000) return;
  lastPrune = now;
  for (const [k, v] of store.entries()) {
    if (v.resetAt < now) store.delete(k);
  }
}

export interface RateLimitResult {
  allowed:   boolean;
  remaining: number;
  resetMs:   number;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  maybePrune();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetMs: windowMs };
  }

  entry.count++;
  const resetMs    = entry.resetAt - now;
  const remaining  = Math.max(0, limit - entry.count);
  return { allowed: entry.count <= limit, remaining, resetMs };
}
