import { describe, it, expect } from "vitest";
import {
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  updateCommentSchema,
  voteSchema,
  reportSchema,
  searchSchema,
} from "@/lib/validators";

describe("createPostSchema", () => {
  it("validates a correct post", () => {
    const result = createPostSchema.safeParse({
      title: "Test post title",
      content: "Some content here",
      type: "discussion",
      communityId: 1,
      tags: ["test"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects title shorter than 5 chars", () => {
    const result = createPostSchema.safeParse({
      title: "Hi",
      type: "discussion",
      communityId: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects title longer than 300 chars", () => {
    const result = createPostSchema.safeParse({
      title: "a".repeat(301),
      type: "discussion",
      communityId: 1,
    });
    expect(result.success).toBe(false);
  });

  it("allows only valid post types (no external_link)", () => {
    const valid = createPostSchema.safeParse({
      title: "Valid title here",
      type: "case_study",
      communityId: 1,
    });
    expect(valid.success).toBe(true);

    const invalid = createPostSchema.safeParse({
      title: "Valid title here",
      type: "external_link",
      communityId: 1,
    });
    expect(invalid.success).toBe(false);
  });

  it("rejects negative communityId", () => {
    const result = createPostSchema.safeParse({
      title: "Valid title here",
      type: "discussion",
      communityId: -1,
    });
    expect(result.success).toBe(false);
  });

  it("defaults content to empty string", () => {
    const result = createPostSchema.safeParse({
      title: "Valid title here",
      type: "discussion",
      communityId: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("");
    }
  });

  it("defaults tags to empty array", () => {
    const result = createPostSchema.safeParse({
      title: "Valid title here",
      type: "discussion",
      communityId: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });

  it("rejects more than 5 tags", () => {
    const result = createPostSchema.safeParse({
      title: "Valid title here",
      type: "discussion",
      communityId: 1,
      tags: ["a", "b", "c", "d", "e", "f"],
    });
    expect(result.success).toBe(false);
  });

  it("validates all four text types", () => {
    const types = ["case_study", "discussion", "article", "quick_question"];
    for (const type of types) {
      const result = createPostSchema.safeParse({
        title: "Valid title here",
        type,
        communityId: 1,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("updatePostSchema", () => {
  it("accepts partial updates", () => {
    expect(updatePostSchema.safeParse({ title: "New title" }).success).toBe(true);
    expect(updatePostSchema.safeParse({ content: "New content" }).success).toBe(true);
    expect(updatePostSchema.safeParse({ tags: ["new"] }).success).toBe(true);
  });

  it("accepts empty object", () => {
    expect(updatePostSchema.safeParse({}).success).toBe(true);
  });

  it("rejects too-short title", () => {
    expect(updatePostSchema.safeParse({ title: "Hi" }).success).toBe(false);
  });
});

describe("createCommentSchema", () => {
  it("validates a correct comment", () => {
    const result = createCommentSchema.safeParse({
      postId: 1,
      content: "Great post!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty content", () => {
    const result = createCommentSchema.safeParse({
      postId: 1,
      content: "",
    });
    expect(result.success).toBe(false);
  });

  it("allows optional parentId", () => {
    const result = createCommentSchema.safeParse({
      postId: 1,
      content: "Reply here",
      parentId: 5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects content over 10000 chars", () => {
    const result = createCommentSchema.safeParse({
      postId: 1,
      content: "a".repeat(10001),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateCommentSchema", () => {
  it("validates content update", () => {
    expect(updateCommentSchema.safeParse({ content: "Updated" }).success).toBe(true);
  });

  it("rejects empty content", () => {
    expect(updateCommentSchema.safeParse({ content: "" }).success).toBe(false);
  });
});

describe("voteSchema", () => {
  it("accepts upvote", () => {
    expect(voteSchema.safeParse({ type: "upvote" }).success).toBe(true);
  });

  it("accepts downvote", () => {
    expect(voteSchema.safeParse({ type: "downvote" }).success).toBe(true);
  });

  it("rejects invalid type", () => {
    expect(voteSchema.safeParse({ type: "sidevote" }).success).toBe(false);
  });
});

describe("reportSchema", () => {
  it("validates a correct report", () => {
    const result = reportSchema.safeParse({
      reason: "Spam content here",
      postId: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects reason shorter than 5 chars", () => {
    expect(reportSchema.safeParse({ reason: "Hi" }).success).toBe(false);
  });

  it("allows optional details", () => {
    const result = reportSchema.safeParse({
      reason: "Spam content detected",
      details: "More details about the issue",
      commentId: 3,
    });
    expect(result.success).toBe(true);
  });
});

describe("searchSchema", () => {
  it("validates a correct search", () => {
    expect(searchSchema.safeParse({ q: "cardiologie" }).success).toBe(true);
  });

  it("rejects query shorter than 2 chars", () => {
    expect(searchSchema.safeParse({ q: "a" }).success).toBe(false);
  });

  it("accepts optional type filter", () => {
    const result = searchSchema.safeParse({
      q: "test query",
      type: "discussion",
    });
    expect(result.success).toBe(true);
  });

  it("rejects external_link as search type", () => {
    const result = searchSchema.safeParse({
      q: "test query",
      type: "external_link",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional community filter", () => {
    const result = searchSchema.safeParse({
      q: "test query",
      community: "cardiologie",
    });
    expect(result.success).toBe(true);
  });
});
