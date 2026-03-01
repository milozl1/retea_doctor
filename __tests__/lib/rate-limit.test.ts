import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

describe("rateLimit", () => {
  // Use unique keys per test to avoid cross-test pollution
  let testKey = "";

  beforeEach(() => {
    testKey = `test-${Date.now()}-${Math.random()}`;
  });

  it("allows first request", () => {
    const result = rateLimit(testKey, { windowMs: 60000, maxRequests: 5 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("decrements remaining count", () => {
    rateLimit(testKey, { windowMs: 60000, maxRequests: 5 });
    const result = rateLimit(testKey, { windowMs: 60000, maxRequests: 5 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(3);
  });

  it("blocks requests after limit exceeded", () => {
    const config = { windowMs: 60000, maxRequests: 2 };
    rateLimit(testKey, config);
    rateLimit(testKey, config);
    const result = rateLimit(testKey, config);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("provides reset timestamp", () => {
    const result = rateLimit(testKey, { windowMs: 60000, maxRequests: 5 });
    expect(result.reset).toBeGreaterThan(Date.now());
  });

  it("uses default config when none provided", () => {
    const result = rateLimit(testKey);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(RATE_LIMITS.default.maxRequests - 1);
  });

  it("separate keys are independent", () => {
    const config = { windowMs: 60000, maxRequests: 1 };
    rateLimit(`${testKey}-a`, config);
    rateLimit(`${testKey}-a`, config); // Should be blocked

    const result = rateLimit(`${testKey}-b`, config);
    expect(result.success).toBe(true);
  });

  describe("RATE_LIMITS constants", () => {
    it("has expected rate limit configs", () => {
      expect(RATE_LIMITS.vote).toEqual({ windowMs: 60_000, maxRequests: 30 });
      expect(RATE_LIMITS.post).toEqual({ windowMs: 3_600_000, maxRequests: 5 });
      expect(RATE_LIMITS.comment).toEqual({ windowMs: 60_000, maxRequests: 20 });
      expect(RATE_LIMITS.search).toEqual({ windowMs: 60_000, maxRequests: 30 });
      expect(RATE_LIMITS.default).toEqual({ windowMs: 60_000, maxRequests: 60 });
    });
  });
});
