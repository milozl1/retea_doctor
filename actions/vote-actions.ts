"use server";

import { db } from "@/db/drizzle";
import { votes, posts, comments, networkUsers, notifications, bookmarks, communityMemberships, communities } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { getOrCreateNetworkUser } from "@/db/queries";
import { eq, and, sql } from "drizzle-orm";

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

  const [existingVote] = await db
    .select()
    .from(votes)
    .where(and(eq(votes.userId, userId), eq(votes.postId, postId)))
    .limit(1);

  if (existingVote) {
    if (existingVote.type === type) {
      await db.delete(votes).where(eq(votes.id, existingVote.id));
      const scoreDelta = type === "upvote" ? -1 : 1;
      await db.update(posts).set({ score: sql`${posts.score} + ${scoreDelta}` }).where(eq(posts.id, postId));
      await db.update(networkUsers).set({ karma: sql`${networkUsers.karma} + ${scoreDelta}` }).where(eq(networkUsers.userId, post.userId));
      return { vote: null };
    } else {
      await db.update(votes).set({ type }).where(eq(votes.id, existingVote.id));
      const scoreDelta = type === "upvote" ? 2 : -2;
      await db.update(posts).set({ score: sql`${posts.score} + ${scoreDelta}` }).where(eq(posts.id, postId));
      await db.update(networkUsers).set({ karma: sql`${networkUsers.karma} + ${scoreDelta}` }).where(eq(networkUsers.userId, post.userId));
      return { vote: type };
    }
  } else {
    await db.insert(votes).values({ userId, postId, type });
    const scoreDelta = type === "upvote" ? 1 : -1;
    await db.update(posts).set({ score: sql`${posts.score} + ${scoreDelta}` }).where(eq(posts.id, postId));
    await db.update(networkUsers).set({ karma: sql`${networkUsers.karma} + ${scoreDelta}` }).where(eq(networkUsers.userId, post.userId));

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
      return { vote: null };
    } else {
      await db.update(votes).set({ type }).where(eq(votes.id, existingVote.id));
      const scoreDelta = type === "upvote" ? 2 : -2;
      await db.update(comments).set({ score: sql`${comments.score} + ${scoreDelta}` }).where(eq(comments.id, commentId));
      return { vote: type };
    }
  } else {
    await db.insert(votes).values({ userId, commentId, type });
    const scoreDelta = type === "upvote" ? 1 : -1;
    await db.update(comments).set({ score: sql`${comments.score} + ${scoreDelta}` }).where(eq(comments.id, commentId));
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
