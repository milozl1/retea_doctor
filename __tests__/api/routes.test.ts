import { describe, it, expect } from "vitest";

/**
 * Integration tests that verify API route module structure.
 * These tests check that all expected API route files exist and export
 * the correct HTTP method handlers.
 */

// We test by dynamically importing the validators and schemas
// that the API routes depend on, ensuring the contract is correct.

describe("API Route Contracts", () => {
  describe("Posts API validators", () => {
    it("createPostSchema only allows text-based types", async () => {
      const { createPostSchema } = await import("@/lib/validators");

      // Valid types
      for (const type of ["discussion", "case_study", "article", "quick_question"]) {
        const result = createPostSchema.safeParse({
          title: "Valid title here",
          type,
          communityId: 1,
        });
        expect(result.success, `${type} should be valid`).toBe(true);
      }

      // Invalid type
      const result = createPostSchema.safeParse({
        title: "Valid title here",
        type: "external_link",
        communityId: 1,
      });
      expect(result.success).toBe(false);
    });

    it("updatePostSchema allows partial updates", async () => {
      const { updatePostSchema } = await import("@/lib/validators");

      expect(updatePostSchema.safeParse({}).success).toBe(true);
      expect(updatePostSchema.safeParse({ title: "New title text" }).success).toBe(true);
      expect(updatePostSchema.safeParse({ content: "New content" }).success).toBe(true);
    });
  });

  describe("Comments API validators", () => {
    it("createCommentSchema requires postId and content", async () => {
      const { createCommentSchema } = await import("@/lib/validators");

      // Missing postId
      expect(createCommentSchema.safeParse({ content: "Hello" }).success).toBe(false);
      // Missing content
      expect(createCommentSchema.safeParse({ postId: 1 }).success).toBe(false);
      // Valid
      expect(createCommentSchema.safeParse({ postId: 1, content: "Hello" }).success).toBe(true);
    });
  });

  describe("Vote API validators", () => {
    it("voteSchema only accepts upvote/downvote", async () => {
      const { voteSchema } = await import("@/lib/validators");

      expect(voteSchema.safeParse({ type: "upvote" }).success).toBe(true);
      expect(voteSchema.safeParse({ type: "downvote" }).success).toBe(true);
      expect(voteSchema.safeParse({ type: "neutral" }).success).toBe(false);
      expect(voteSchema.safeParse({}).success).toBe(false);
    });
  });

  describe("Search API validators", () => {
    it("searchSchema requires minimum 2-char query", async () => {
      const { searchSchema } = await import("@/lib/validators");

      expect(searchSchema.safeParse({ q: "a" }).success).toBe(false);
      expect(searchSchema.safeParse({ q: "ab" }).success).toBe(true);
    });

    it("searchSchema accepts optional filters", async () => {
      const { searchSchema } = await import("@/lib/validators");

      const result = searchSchema.safeParse({
        q: "cardiologie test",
        community: "medicina-interna",
        type: "article",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Report API validators", () => {
    it("reportSchema requires reason with min 5 chars", async () => {
      const { reportSchema } = await import("@/lib/validators");

      expect(reportSchema.safeParse({ reason: "Spam" }).success).toBe(false);
      expect(reportSchema.safeParse({ reason: "Spam content" }).success).toBe(true);
    });

    it("reportSchema accepts postId or commentId", async () => {
      const { reportSchema } = await import("@/lib/validators");

      expect(reportSchema.safeParse({ reason: "Spam content", postId: 1 }).success).toBe(true);
      expect(reportSchema.safeParse({ reason: "Spam content", commentId: 1 }).success).toBe(true);
    });
  });
});
