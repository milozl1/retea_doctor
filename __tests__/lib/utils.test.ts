import { describe, it, expect } from "vitest";
import { cn, formatDate, timeAgo, formatNumber, truncate, slugify } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("merges tailwind conflicts correctly", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("handles undefined/null", () => {
    expect(cn("a", undefined, null, "b")).toBe("a b");
  });
});

describe("formatDate", () => {
  it("formats a Date object in Romanian locale", () => {
    const result = formatDate(new Date("2026-03-01"));
    expect(result).toContain("2026");
    expect(result).toContain("martie");
  });

  it("formats a date string", () => {
    const result = formatDate("2026-01-15");
    expect(result).toContain("ianuarie");
    expect(result).toContain("2026");
  });
});

describe("timeAgo", () => {
  it('returns "acum" for very recent times', () => {
    const now = new Date();
    expect(timeAgo(now)).toBe("acum");
  });

  it("returns minutes for < 1h", () => {
    const d = new Date(Date.now() - 5 * 60 * 1000);
    expect(timeAgo(d)).toBe("5m");
  });

  it("returns hours for < 1d", () => {
    const d = new Date(Date.now() - 3 * 3600 * 1000);
    expect(timeAgo(d)).toBe("3h");
  });

  it("returns days for < 1w", () => {
    const d = new Date(Date.now() - 2 * 86400 * 1000);
    expect(timeAgo(d)).toBe("2z");
  });

  it("returns weeks for < 1mo", () => {
    const d = new Date(Date.now() - 14 * 86400 * 1000);
    expect(timeAgo(d)).toBe("2săpt");
  });

  it("returns months for < 1y", () => {
    const d = new Date(Date.now() - 90 * 86400 * 1000);
    expect(timeAgo(d)).toBe("3l");
  });

  it("returns years for > 1y", () => {
    const d = new Date(Date.now() - 400 * 86400 * 1000);
    expect(timeAgo(d)).toBe("1a");
  });
});

describe("formatNumber", () => {
  it("returns number as-is for < 1000", () => {
    expect(formatNumber(42)).toBe("42");
    expect(formatNumber(999)).toBe("999");
  });

  it("formats thousands with K", () => {
    expect(formatNumber(1000)).toBe("1K");
    expect(formatNumber(1500)).toBe("1.5K");
    expect(formatNumber(10000)).toBe("10K");
  });

  it("formats millions with M", () => {
    expect(formatNumber(1000000)).toBe("1M");
    expect(formatNumber(2500000)).toBe("2.5M");
  });

  it("strips trailing .0", () => {
    expect(formatNumber(2000)).toBe("2K");
    expect(formatNumber(3000000)).toBe("3M");
  });
});

describe("truncate", () => {
  it("returns string unchanged if shorter than limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("returns string unchanged if equal to limit", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("truncates and adds ellipsis when longer", () => {
    expect(truncate("hello world", 5)).toBe("hello...");
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });
});

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces Romanian characters", () => {
    expect(slugify("Știri și Articole")).toBe("stiri-si-articole");
    expect(slugify("Țară și Înțelepciune")).toBe("tara-si-intelepciune");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! @World #2026")).toBe("hello-world-2026");
  });

  it("removes leading/trailing dashes", () => {
    expect(slugify("--hello--")).toBe("hello");
  });

  it("collapses multiple separators", () => {
    expect(slugify("a   b   c")).toBe("a-b-c");
  });
});
