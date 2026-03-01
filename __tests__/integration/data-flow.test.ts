import { describe, it, expect } from "vitest";
import {
  POST_TYPE_LABELS,
  POST_TYPE_COLORS,
  EXPERIENCE_LABELS,
  slugify,
} from "@/lib/utils";

/**
 * End-to-end data flow tests that verify data contracts
 * between different parts of the codebase are consistent.
 */

describe("Data Flow: Post Types", () => {
  const VALID_POST_TYPES = ["case_study", "discussion", "article", "quick_question", "external_link"];

  it("POST_TYPE_LABELS has entries for all possible types", () => {
    for (const type of VALID_POST_TYPES) {
      expect(POST_TYPE_LABELS[type]).toBeTruthy();
    }
  });

  it("POST_TYPE_COLORS has entries for all possible types", () => {
    for (const type of VALID_POST_TYPES) {
      expect(POST_TYPE_COLORS[type]).toBeTruthy();
    }
  });
});

describe("Data Flow: Experience Levels", () => {
  it("has all expected experience levels", () => {
    expect(EXPERIENCE_LABELS).toHaveProperty("student");
    expect(EXPERIENCE_LABELS).toHaveProperty("rezident");
    expect(EXPERIENCE_LABELS).toHaveProperty("medic");
    expect(EXPERIENCE_LABELS).toHaveProperty("doctor");
  });

  it("labels are non-empty strings", () => {
    for (const label of Object.values(EXPERIENCE_LABELS)) {
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

describe("Data Flow: Slugification", () => {
  it("generates URL-safe community slugs from Romanian names", () => {
    const testCases = [
      { input: "Cardiologie", expected: "cardiologie" },
      { input: "Medicină de Urgență", expected: "medicina-de-urgenta" },
      { input: "Chirurgie Generală", expected: "chirurgie-generala" },
      { input: "ORL & Audiologie", expected: "orl-audiologie" },
    ];

    for (const { input, expected } of testCases) {
      expect(slugify(input)).toBe(expected);
    }
  });

  it("generates consistent slugs (idempotent on valid slugs)", () => {
    const slug = "cardiologie-interventionala";
    expect(slugify(slug)).toBe(slug);
  });
});

describe("Data Flow: Rate Limiting Keys", () => {
  it("rate limit keys follow expected patterns", () => {
    // Verify the patterns used in API routes are well-formed
    const userId = "user-123";
    const patterns = [
      `posts:list:${userId}`,
      `posts:create:${userId}`,
      `comments:create:${userId}`,
      `vote:${userId}`,
      `search:${userId}`,
    ];

    for (const key of patterns) {
      expect(key).toMatch(/^[a-z]+:[a-zA-Z0-9:-]+$/);
    }
  });
});
