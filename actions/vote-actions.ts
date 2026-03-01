"use server";

import { db } from "@/db/drizzle";
import { votes, posts, comments, networkUsers, notifications, bookmarks, communityMemberships, communities } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { getOrCreateNetworkUser } from "@/db/queries";
import { calculateHotScore } from "@/lib/hot-score";
import { eq, and, sql } from "drizzle-orm";

async function updatePostHotScore(postId: number) {
  const [post] = await db.select({ score: posts.score, createdAt: posts.createdAt }).from(posts).where(eq(posts.id, postId)).limit(1);
  if (post) {
    const newHot = calculateHotScore(post.score, post.createdAt);
    await db.update(posts).set({ hotScore: newHot }).where(eq(posts.id, postId));
  }
}

export async function voteOnPost(data: { postId: number; type: "upvote" | "downvote" }) {
  const { userId, user } = await requireAuth();

  await getOrCreateNetworkUser({
    userId,
    userName: user.firstName,
    userImageSrc: user.imageUrl,
  });

  const { postId, type } = data;

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    return { error: "Postarea nu există" };
  }

  // H6: Prevent self-voting
  if (post.userId === userId) {
    return { error: "Nu poți vota propria postare" };
  }

  const [existingVote] = await db
    .select()
    .from(votes)
    .where(and(eq(votes.userId, userId), eq(votes.postId, postId)))
    .limit(1);

  if (existingVote) {
    if (existingVote.type === type) {
      // Remove vote
      await db.delete(votes).where(eq(votes.id, existingVote.id));
      const scoreDelta = type === "upvote" ? -1 : 1;
      const upDelta = type === "upvote" ? -1 : 0;
      const downDelta = type === "downvote" ? -1 : 0;
      await db.update(posts).set({
        score: sql`${posts.score} + ${scoreDelta}`,
        upvotes: sql`GREATEST(${posts.upvotes} + ${upDelta}, 0)`,
        downvotes: sql`GREATEST(${posts.downvotes} + ${downDelta}, 0)`,
      }).where(eq(posts.id, postId));
      await db.update(networkUsers).set({ karma: sql`${networkUsers.karma} + ${scoreDelta}` }).where(eq(networkUsers.userId, post.userId));
      await updatePostHotScore(postId);
      return { vote: null };
    } else {
      // Change vote
      await db.update(votes).set({ type }).where(eq(votes.id, existingVote.id));
      const scoreDelta = type === "upvote" ? 2 : -2;
      const upDelta = type === "upvote" ? 1 : -1;
      const downDelta = type === "downvote" ? 1 : -1;
      await db.update(posts).set({
        score: sql`${posts.score} + ${scoreDelta}`,
        upvotes: sql`GREATEST(${posts.upvotes} + ${upDelta}, 0)`,
        downvotes: sql`GREATEST(${posts.downvotes} + ${downDelta}, 0)`,
      }).where(eq(posts.id, postId));
      await db.update(networkUsers).set({ karma: sql`${networkUsers.karma} + ${scoreDelta}` }).where(eq(networkUsers.userId, post.userId));
      await updatePostHotScore(postId);
      return { vote: type };
    }
  } else {
    // New vote
    await db.insert(votes).values({ userId, postId, type });
    const scoreDelta = type === "upvote" ? 1 : -1;
    await db.update(posts).set({
      score: sql`${posts.score} + ${scoreDelta}`,
      upvotes: type === "upvote" ? sql`${posts.upvotes} + 1` : posts.upvotes,
      downvotes: type === "downvote" ? sql`${posts.downvotes} + 1` : posts.downvotes,
    }).where(eq(posts.id, postId));
    await db.update(networkUsers).set({ karma: sql`${networkUsers.karma} + ${scoreDelta}` }).where(eq(networkUsers.userId, post.userId));
    await updatePostHotScore(postId);

    if (type === "upvote" && post.userId !== userId) {
      await db.insert(notifications).values({
        userId: post.userId,
        actorId: userId,
        type: "upvote",
        postId,
        message: "a votat pozitiv postarea ta",
      });
    }

    return { vote: type };
  }
}

export async function voteOnComment(data: { commentId: number; type: "upvote" | "downvote" }) {
  const { userId, user } = await requireAuth();

  await getOrCreateNetworkUser({
    userId,
    userName: user.firstName,
    userImageSrc: user.imageUrl,
  });

  const { commentId, type } = data;

  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!comment) {
    return { error: "Comentariul nu există" };
  }

  // H6: Prevent self-voting
  if (comment.userId === userId) {
    return { error: "Nu poți vota propriul comentariu" };
  }

  const [existingVote] = await db
    .select()
    .from(votes)
    .where(and(eq(votes.userId, userId), eq(votes.commentId, commentId)))
    .limit(1);

  if (existingVote) {
    if (existingVote.type === type) {
      await db.delete(votes).where(eq(votes.id, existingVote.id));
      const scoreDelta = type === "upvote" ? -1 : 1;
      await db.update(comments).set({ score: sql`${comments.score} + ${scoreDelta}` }).where(eq(comments.id, commentId));
      await db.update(networkUsers).set({ karma: sql`${networkUsers.karma} + ${scoreDelta}` }).where(eq(networkUsers.userId, comment.userId));
      return { vote: null };
    } else {
      await db.update(votes).set({ type }).where(eq(votes.id, existingVote.id));
      const scoreDelta = type === "upvote" ? 2 : -2;
      await db.update(comments).set({ score: sql`${comments.score} + ${scoreDelta}` }).where(eq(comments.id, commentId));
      await db.update(networkUsers).set({ karma: sql`${networkUsers.karma} + ${scoreDelta}` }).where(eq(networkUsers.userId, comment.userId));
      return { vote: type };
    }
  } else {
    await db.insert(votes).values({ userId, commentId, type });
    const scoreDelta = type === "upvote" ? 1 : -1;
    await db.update(comments).set({ score: sql`${comments.score} + ${scoreDelta}` }).where(eq(comments.id, commentId));
    await db.update(networkUsers).set({ karma: sql`${networkUsers.karma} + ${scoreDelta}` }).where(eq(networkUsers.userId, comment.userId));
    return { vote: type };
  }
}

export async function toggleBookmark(postId: number) {
  const { userId, user } = await requireAuth();

  await getOrCreateNetworkUser({
    userId,
    userName: user.firstName,
    userImageSrc: user.imageUrl,
  });

  const [existing] = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)))
    .limit(1);

  if (existing) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing.id));
    return { bookmarked: false };
  } else {
    await db.insert(bookmarks).values({ userId, postId });
    return { bookmarked: true };
  }
}

export async function joinCommunity(communityId: number) {
  const { userId, user } = await requireAuth();

  await getOrCreateNetworkUser({
    userId,
    userName: user.firstName,
    userImageSrc: user.imageUrl,
  });

  const [existing] = await db
    .select()
    .from(communityMemberships)
    .where(
      and(
        eq(communityMemberships.userId, userId),
        eq(communityMemberships.communityId, communityId)
      )
    )
    .limit(1);

  if (existing) {
    await db.delete(communityMemberships).where(eq(communityMemberships.id, existing.id));
    await db.update(communities).set({ memberCount: sql`${communities.memberCount} - 1` }).where(eq(communities.id, communityId));
    return { joined: false };
  } else {
    await db.insert(communityMemberships).values({ userId, communityId });
    await db.update(communities).set({ memberCount: sql`${communities.memberCount} + 1` }).where(eq(communities.id, communityId));
    return { joined: true };
  }
}
