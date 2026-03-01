import { describe, it, expect } from "vitest";
import { calculateHotScore, hotScore } from "@/lib/hot-score";

describe("calculateHotScore", () => {
  it("returns a number", () => {
    const result = calculateHotScore(10, new Date("2026-02-01"));
    expect(typeof result).toBe("number");
  });

  it("higher score gives higher hot score with same time", () => {
    const time = new Date("2026-02-15");
    const a = calculateHotScore(10, time);
    const b = calculateHotScore(100, time);
    expect(b).toBeGreaterThan(a);
  });

  it("newer post with same score ranks higher", () => {
    const early = new Date("2026-01-15");
    const later = new Date("2026-02-15");
    const a = calculateHotScore(10, early);
    const b = calculateHotScore(10, later);
    expect(b).toBeGreaterThan(a);
  });

  it("handles zero score", () => {
    const result = calculateHotScore(0, new Date("2026-02-01"));
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThan(0); // time component still positive
  });

  it("handles negative score", () => {
    const time = new Date("2026-02-01");
    const neg = calculateHotScore(-10, time);
    const pos = calculateHotScore(10, time);
    expect(pos).toBeGreaterThan(neg);
  });
});

describe("hotScore", () => {
  it("returns a number", () => {
    const result = hotScore(10, 2, new Date("2026-02-01"));
    expect(typeof result).toBe("number");
  });

  it("more upvotes gives higher score", () => {
    const time = new Date("2026-02-01");
    const a = hotScore(5, 0, time);
    const b = hotScore(50, 0, time);
    expect(b).toBeGreaterThan(a);
  });

  it("more downvotes gives lower score", () => {
    const time = new Date("2026-02-01");
    const a = hotScore(10, 0, time);
    const b = hotScore(10, 8, time);
    expect(a).toBeGreaterThan(b);
  });

  it("newer content with same votes ranks higher", () => {
    const a = hotScore(10, 2, new Date("2026-01-01"));
    const b = hotScore(10, 2, new Date("2026-02-15"));
    expect(b).toBeGreaterThan(a);
  });

  it("returns precise decimal value", () => {
    const result = hotScore(1, 0, new Date("2026-01-02"));
    // Should have decimal precision
    expect(result.toString()).toMatch(/\d+\.\d+/);
  });
});
