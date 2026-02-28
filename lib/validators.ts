import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .min(3, "Titlul trebuie să aibă cel puțin 3 caractere")
    .max(300, "Titlul nu poate depăși 300 caractere"),
  content: z.string().max(40000, "Conținutul nu poate depăși 40000 caractere").optional().default(""),
  type: z.enum([
    "case_study",
    "discussion",
    "article",
    "quick_question",
    "external_link",
  ]),
  communityId: z.number().int().positive(),
  linkUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
  caseStudyId: z.number().int().positive().optional().nullable(),
});

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(3)
    .max(300)
    .optional(),
  content: z.string().max(40000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const createCommentSchema = z.object({
  postId: z.number().int().positive(),
  content: z
    .string()
    .min(1, "Comentariul nu poate fi gol")
    .max(10000, "Comentariul nu poate depăși 10000 caractere"),
  parentId: z.number().int().positive().optional().nullable(),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1)
    .max(10000),
});

export const voteSchema = z.object({
  type: z.enum(["upvote", "downvote"]),
});

export const reportSchema = z.object({
  reason: z.string().min(1).max(200),
  details: z.string().max(1000).optional(),
  postId: z.number().int().positive().optional(),
  commentId: z.number().int().positive().optional(),
});

export const searchSchema = z.object({
  q: z.string().min(1).max(200),
  communityId: z.number().int().positive().optional(),
  type: z
    .enum(["case_study", "discussion", "article", "quick_question", "external_link"])
    .optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(["hot", "new", "top"]).default("hot"),
  communityId: z.coerce.number().int().positive().optional(),
});
