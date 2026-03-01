"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { votes, posts, comments, networkUsers } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

type VoteTarget = "post" | "comment";
type VoteType = "upvote" | "downvote";

export async function vote(
  targetType: VoteTarget,
  targetId: number,
  voteType: VoteType
): Promise<{
  success: boolean;
  action: "added" | "removed" | "changed";
  error?: string;
}> {
  try {
    const user = await requireAuth();

    // Get existing vote
    const existingVote = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.userId, user.id),
          targetType === "post"
            ? eq(votes.postId, targetId)
            : eq(votes.commentId, targetId)
        )
      )
      .limit(1);

    const existing = existingVote[0];

    if (existing) {
      if (existing.type === voteType) {
        // Remove vote
        await db.delete(votes).where(eq(votes.id, existing.id));
        await updateCounts(targetType, targetId, voteType, "remove");
        return { success: true, action: "removed" };
      } else {
        // Change vote
        await db
          .update(votes)
          .set({ type: voteType })
          .where(eq(votes.id, existing.id));
        await updateCounts(targetType, targetId, existing.type as VoteType, "remove");
        await updateCounts(targetType, targetId, voteType, "add");
        return { success: true, action: "changed" };
      }
    } else {
      // Add vote
      await db.insert(votes).values({
        userId: user.id,
        postId: targetType === "post" ? targetId : null,
        commentId: targetType === "comment" ? targetId : null,
        type: voteType,
      });
      await updateCounts(targetType, targetId, voteType, "add");
      return { success: true, action: "added" };
    }
  } catch {
    return { success: false, action: "added", error: "Eroare la vot" };
  }
}

async function updateCounts(
  targetType: VoteTarget,
  targetId: number,
  voteType: VoteType,
  action: "add" | "remove"
) {
  const delta = action === "add" ? 1 : -1;

  if (targetType === "post") {
    if (voteType === "upvote") {
      await db
        .update(posts)
        .set({
          upvotes: sql`GREATEST(${posts.upvotes} + ${delta}, 0)`,
          score: sql`GREATEST(${posts.upvotes} + ${delta}, 0) - ${posts.downvotes}`,
        })
        .where(eq(posts.id, targetId));
    } else {
      await db
        .update(posts)
        .set({
          downvotes: sql`GREATEST(${posts.downvotes} + ${delta}, 0)`,
          score: sql`${posts.upvotes} - GREATEST(${posts.downvotes} + ${delta}, 0)`,
        })
        .where(eq(posts.id, targetId));
    }

    // Update author karma
    const [post] = await db
      .select({ userId: posts.userId })
      .from(posts)
      .where(eq(posts.id, targetId))
      .limit(1);

    if (post) {
      const karmaDelta = voteType === "upvote" ? delta : -delta;
      await db
        .update(networkUsers)
        .set({
          karma: sql`GREATEST(${networkUsers.karma} + ${karmaDelta}, 0)`,
        })
        .where(eq(networkUsers.userId, post.userId));
    }
  } else {
    if (voteType === "upvote") {
      await db
        .update(comments)
        .set({
          upvotes: sql`GREATEST(${comments.upvotes} + ${delta}, 0)`,
          score: sql`GREATEST(${comments.upvotes} + ${delta}, 0) - ${comments.downvotes}`,
        })
        .where(eq(comments.id, targetId));
    } else {
      await db
        .update(comments)
        .set({
          downvotes: sql`GREATEST(${comments.downvotes} + ${delta}, 0)`,
          score: sql`${comments.upvotes} - GREATEST(${comments.downvotes} + ${delta}, 0)`,
        })
        .where(eq(comments.id, targetId));
    }
  }

  revalidatePath("/");
}
