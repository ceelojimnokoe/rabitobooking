/**
 * Simple in-memory, demo-friendly rate limiter (sliding window per key,
 * usually the requester's IP address). Good enough to blunt naive scripted
 * abuse of the booking endpoint on a single server instance.
 *
 * Not suitable for a real production deployment across multiple serverless
 * instances — see PRODUCTION-READINESS.md for the recommended upgrade path
 * (a shared store such as Upstash Redis).
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export function checkRateLimit(
  key: string,
  now: number = Date.now(),
): RateLimitResult {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterMs = WINDOW_MS - (now - recent[0]);
    return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  recent.push(now);
  hits.set(key, recent);
  return { allowed: true };
}
