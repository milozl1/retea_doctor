import { describe, it, expect } from "vitest";
import { POST_TYPE_OPTIONS, SORT_OPTIONS, COMMENT_SORT_OPTIONS, REPORT_REASONS } from "@/config/constants";

describe("POST_TYPE_OPTIONS", () => {
  it("has exactly 4 text-based post types", () => {
    expect(POST_TYPE_OPTIONS).toHaveLength(4);
  });

  it("contains discussion, case_study, article, quick_question", () => {
    const values = POST_TYPE_OPTIONS.map((o) => o.value);
    expect(values).toContain("discussion");
    expect(values).toContain("case_study");
    expect(values).toContain("article");
    expect(values).toContain("quick_question");
  });

  it("does NOT contain external_link", () => {
    const values = POST_TYPE_OPTIONS.map((o) => o.value);
    expect(values).not.toContain("external_link");
  });

  it("each option has value, label, icon, and description", () => {
    for (const opt of POST_TYPE_OPTIONS) {
      expect(opt.value).toBeTruthy();
      expect(opt.label).toBeTruthy();
      expect(opt.icon).toBeTruthy();
      expect(opt.description).toBeTruthy();
    }
  });
});

describe("SORT_OPTIONS", () => {
  it("has hot, new, top options", () => {
    const values = SORT_OPTIONS.map((o) => o.value);
    expect(values).toEqual(["hot", "new", "top"]);
  });
});

describe("COMMENT_SORT_OPTIONS", () => {
  it("has best, new, old options", () => {
    const values = COMMENT_SORT_OPTIONS.map((o) => o.value);
    expect(values).toEqual(["best", "new", "old"]);
  });
});

describe("REPORT_REASONS", () => {
  it("has at least 5 reasons", () => {
    expect(REPORT_REASONS.length).toBeGreaterThanOrEqual(5);
  });

  it("includes Spam and Altele", () => {
    expect(REPORT_REASONS).toContain("Spam");
    expect(REPORT_REASONS).toContain("Altele");
  });

  it("includes medical-specific reasons", () => {
    expect(REPORT_REASONS).toContain("Informații medicale false");
    expect(REPORT_REASONS).toContain("Date pacient neaonimizate");
  });
});
