/**
 * In-memory rate limiter keyed by (userId, routeKey).
 *
 * LIMITATION: Serverless functions do not share memory across instances, so
 * this is best-effort protection. It is effective within a single warm instance
 * but will not prevent burst abuse spread across cold-start invocations.
 * For strict multi-instance enforcement, replace with a Redis-backed solution.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodically clean up expired entries to prevent unbounded memory growth.
// Runs every 5 minutes.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    // Remove entries whose window is clearly expired (give 2× window as grace)
    if (now - entry.windowStart > CLEANUP_INTERVAL_MS * 2) {
      store.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

/**
 * Check whether a given user is within their rate limit for a specific route.
 *
 * @param userId     Authenticated user ID (from Supabase auth).
 * @param key        Route key (e.g. "wizard-recommend").
 * @param maxRequests Maximum number of requests allowed per window.
 * @param windowMs   Window size in milliseconds.
 * @returns `true` if the request is allowed, `false` if the limit is exceeded.
 */
export function checkRateLimit(userId: string, key: string, maxRequests: number, windowMs: number): boolean {
  const storeKey = `${userId}:${key}`;
  const now = Date.now();
  const entry = store.get(storeKey);

  if (!entry || now - entry.windowStart >= windowMs) {
    // Start a fresh window
    store.set(storeKey, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count += 1;
  return true;
}
