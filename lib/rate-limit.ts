const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

// On-demand cleanup of expired entries to avoid persistent intervals in serverless environments
function cleanupExpired(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  rateLimitMap.forEach((value, key) => {
    if (now > value.resetAt) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => rateLimitMap.delete(key));
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();

  // Clean up expired entries on each call when map is large
  if (rateLimitMap.size > 1000) {
    cleanupExpired();
  }

  const existing = rateLimitMap.get(identifier);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + options.windowMs;
    rateLimitMap.set(identifier, { count: 1, resetAt });
    return { success: true, remaining: options.max - 1, resetAt };
  }

  if (existing.count >= options.max) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count++;
  return {
    success: true,
    remaining: options.max - existing.count,
    resetAt: existing.resetAt,
  };
}
