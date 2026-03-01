"use server";

import { db } from "@/db/drizzle";
import { comments, posts, networkUsers, notifications } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { getOrCreateNetworkUser } from "@/db/queries";
import { createCommentSchema } from "@/lib/validators";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { MAX_COMMENT_DEPTH } from "@/config/constants";

export async function createComment(formData: unknown) {
  const { userId, user } = await requireAuth();

  const parsed = createCommentSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Date invalide" };
  }

  await getOrCreateNetworkUser({
    userId,
    userName: user.firstName,
    userImageSrc: user.imageUrl,
  });

  const data = parsed.data;
  let depth = 0;

  // Check parent comment if replying
  if (data.parentId) {
    const [parent] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, data.parentId))
      .limit(1);

    if (!parent) {
      return { error: "Comentariul părinte nu există" };
    }

    if (parent.depth >= MAX_COMMENT_DEPTH) {
      return { error: "Nivel maxim de nesting atins" };
    }

    depth = parent.depth + 1;
  }

  // Check post exists and isn't locked
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, data.postId))
    .limit(1);

  if (!post) {
    return { error: "Postarea nu există" };
  }

  if (post.isLocked) {
    return { error: "Postarea este blocată" };
  }

  const [comment] = await db
    .insert(comments)
    .values({
      postId: data.postId,
      userId,
      parentId: data.parentId || null,
      content: data.content,
      depth,
    })
    .returning();

  // Update denormalized counts
  await db
    .update(posts)
    .set({ commentCount: sql`${posts.commentCount} + 1` })
    .where(eq(posts.id, data.postId));

  await db
    .update(networkUsers)
    .set({ commentCount: sql`${networkUsers.commentCount} + 1` })
    .where(eq(networkUsers.userId, userId));

  // Create notification for post author (if not commenting on own post)
  if (post.userId !== userId && !data.parentId) {
    await db.insert(notifications).values({
      userId: post.userId,
      actorId: userId,
      type: "reply_post",
      postId: data.postId,
      commentId: comment.id,
      message: "a comentat la postarea ta",
    });
  }

  // Create notification for parent comment author (if replying)
  if (data.parentId) {
    const [parentComment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, data.parentId))
      .limit(1);

    if (parentComment && parentComment.userId !== userId) {
      await db.insert(notifications).values({
        userId: parentComment.userId,
        actorId: userId,
        type: "reply_comment",
        postId: data.postId,
        commentId: comment.id,
        message: "a răspuns la comentariul tău",
      });
    }
  }

  revalidatePath(`/post/${data.postId}`);
  return { id: comment.id };
}

export async function deleteComment(commentId: number) {
  const { userId } = await requireAuth();

  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!comment || comment.userId !== userId) {
    return { error: "Nu poți șterge acest comentariu" };
  }

  await db
    .update(comments)
    .set({ isDeleted: true })
    .where(eq(comments.id, commentId));

  revalidatePath(`/post/${comment.postId}`);
  return { success: true };
}
