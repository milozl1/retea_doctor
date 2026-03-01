"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { comments, posts, networkUsers, notifications } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { createCommentSchema } from "@/lib/validators";
import { z } from "zod";

export async function createComment(
  data: z.infer<typeof createCommentSchema>
): Promise<{ success: boolean; commentId?: number; error?: string }> {
  try {
    const user = await requireAuth();
    const validated = createCommentSchema.parse(data);

    // Ensure network user exists
    await db
      .insert(networkUsers)
      .values({
        userId: user.id,
        userName: user.firstName,
        userImageSrc: user.imageUrl,
        experienceLevel: "student",
      })
      .onConflictDoNothing();

    // Determine depth
    let depth = 0;
    if (validated.parentId) {
      const [parent] = await db
        .select({ depth: comments.depth })
        .from(comments)
        .where(eq(comments.id, validated.parentId))
        .limit(1);
      depth = Math.min((parent?.depth ?? 0) + 1, 5);
    }

    const [comment] = await db
      .insert(comments)
      .values({
        postId: validated.postId,
        userId: user.id,
        parentId: validated.parentId ?? null,
        content: validated.content,
        depth,
      })
      .returning({ id: comments.id });

    if (!comment) throw new Error("Nu s-a putut crea comentariul");

    // Increment comment count on post
    await db
      .update(posts)
      .set({ commentCount: sql`${posts.commentCount} + 1` })
      .where(eq(posts.id, validated.postId));

    // Increment user comment count
    await db
      .update(networkUsers)
      .set({ commentCount: sql`${networkUsers.commentCount} + 1` })
      .where(eq(networkUsers.userId, user.id));

    // Send notification to post author
    const [post] = await db
      .select({ userId: posts.userId })
      .from(posts)
      .where(eq(posts.id, validated.postId))
      .limit(1);

    if (post && post.userId !== user.id) {
      await db.insert(notifications).values({
        userId: post.userId,
        actorId: user.id,
        type: "reply_post",
        postId: validated.postId,
        commentId: comment.id,
        message: "a răspuns la postarea ta",
      });
    }

    revalidatePath(`/post/${validated.postId}`);

    return { success: true, commentId: comment.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Date invalide" };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Eroare la creare",
    };
  }
}

export async function deleteComment(
  commentId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();

    const [comment] = await db
      .select({ userId: comments.userId, postId: comments.postId })
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!comment) return { success: false, error: "Comentariul nu a fost găsit" };

    const [netUser] = await db
      .select({ role: networkUsers.role })
      .from(networkUsers)
      .where(eq(networkUsers.userId, user.id))
      .limit(1);

    if (comment.userId !== user.id && netUser?.role !== "admin") {
      return { success: false, error: "Nu ai permisiune" };
    }

    await db
      .update(comments)
      .set({ isDeleted: true })
      .where(eq(comments.id, commentId));

    // Decrement post comment count
    await db
      .update(posts)
      .set({ commentCount: sql`GREATEST(${posts.commentCount} - 1, 0)` })
      .where(eq(posts.id, comment.postId));

    revalidatePath(`/post/${comment.postId}`);

    return { success: true };
  } catch {
    return { success: false, error: "Eroare la ștergere" };
  }
}
