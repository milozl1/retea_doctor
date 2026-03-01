const rateLimitMap = new Map<
  string,
  { count: number; lastReset: number }
>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export const RATE_LIMITS = {
  vote: { windowMs: 60_000, maxRequests: 30 },
  post: { windowMs: 3_600_000, maxRequests: 5 },
  comment: { windowMs: 60_000, maxRequests: 20 },
  search: { windowMs: 60_000, maxRequests: 30 },
  default: { windowMs: 60_000, maxRequests: 60 },
} as const;

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.default
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const key = identifier;
  const entry = rateLimitMap.get(key);

  if (!entry || now - entry.lastReset >= config.windowMs) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      reset: now + config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      reset: entry.lastReset + config.windowMs,
    };
  }

  entry.count++;
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    reset: entry.lastReset + config.windowMs,
  };
}

// Note: In-memory rate limiting only works in Node.js long-running process mode.
// For serverless (Vercel), each invocation gets a fresh Map.
// For production serverless, replace with Redis-based rate limiting.
