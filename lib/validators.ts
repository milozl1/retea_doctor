import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .min(5, "Titlul trebuie să aibă cel puțin 5 caractere")
    .max(300, "Titlul nu poate depăși 300 de caractere"),
  content: z
    .string()
    .max(40000, "Conținutul nu poate depăși 40.000 de caractere")
    .default(""),
  type: z.enum([
    "case_study",
    "discussion",
    "article",
    "quick_question",
  ]),
  communityId: z.number().int().positive("Selectează o comunitate"),
  tags: z
    .array(z.string().max(50))
    .max(5, "Maximum 5 tag-uri")
    .default([]),
});

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(5, "Titlul trebuie să aibă cel puțin 5 caractere")
    .max(300, "Titlul nu poate depăși 300 de caractere")
    .optional(),
  content: z
    .string()
    .max(40000, "Conținutul nu poate depăși 40.000 de caractere")
    .optional(),
  tags: z
    .array(z.string().max(50))
    .max(5, "Maximum 5 tag-uri")
    .optional(),
});

export const createCommentSchema = z.object({
  postId: z.number().int().positive(),
  content: z
    .string()
    .min(1, "Comentariul nu poate fi gol")
    .max(10000, "Comentariul nu poate depăși 10.000 de caractere"),
  parentId: z.number().int().positive().optional(),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comentariul nu poate fi gol")
    .max(10000, "Comentariul nu poate depăși 10.000 de caractere"),
});

export const voteSchema = z.object({
  type: z.enum(["upvote", "downvote"]),
});

export const reportSchema = z.object({
  reason: z
    .string()
    .min(5, "Motivul trebuie să aibă cel puțin 5 caractere")
    .max(500, "Motivul nu poate depăși 500 de caractere"),
  details: z
    .string()
    .max(2000, "Detaliile nu pot depăși 2.000 de caractere")
    .optional(),
  postId: z.number().int().positive().optional(),
  commentId: z.number().int().positive().optional(),
});

export const searchSchema = z.object({
  q: z.string().min(2, "Caută cel puțin 2 caractere").max(200),
  community: z.string().optional(),
  type: z
    .enum([
      "case_study",
      "discussion",
      "article",
      "quick_question",
    ])
    .optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
