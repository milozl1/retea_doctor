import { cache } from "react";
import { db } from "./drizzle";
import {
  networkUsers,
  communities,
  posts,
  comments,
  votes,
  bookmarks,
  notifications,
  communityMemberships,
} from "./schema";
import { eq, desc, asc, and, sql, or, ilike, ne } from "drizzle-orm";

// ==================== USER QUERIES ====================

export const getNetworkUser = cache(async (userId: string) => {
  const [user] = await db
    .select()
    .from(networkUsers)
    .where(eq(networkUsers.userId, userId))
    .limit(1);
  return user ?? null;
});

export const getOrCreateNetworkUser = async (userData: {
  userId: string;
  userName: string;
  userImageSrc: string;
}) => {
  const existing = await getNetworkUser(userData.userId);
  if (existing) return existing;

  const [created] = await db
    .insert(networkUsers)
    .values({
      userId: userData.userId,
      userName: userData.userName,
      userImageSrc: userData.userImageSrc,
    })
    .returning();
  return created;
};

// ==================== COMMUNITY QUERIES ====================

export const getCommunities = cache(async () => {
  return db
    .select()
    .from(communities)
    .orderBy(asc(communities.name));
});

export const getCommunityBySlug = cache(async (slug: string) => {
  const [community] = await db
    .select()
    .from(communities)
    .where(eq(communities.slug, slug))
    .limit(1);
  return community ?? null;
});

export const getUserCommunities = cache(async (userId: string) => {
  return db
    .select({
      community: communities,
      membership: communityMemberships,
    })
    .from(communityMemberships)
    .innerJoin(communities, eq(communityMemberships.communityId, communities.id))
    .where(eq(communityMemberships.userId, userId));
});

// ==================== POST QUERIES ====================

export const getPostsForFeed = async ({
  communityId,
  sort = "new",
  cursor,
  limit = 20,
}: {
  communityId?: number;
  sort?: "hot" | "new" | "top";
  cursor?: number;
  limit?: number;
}) => {
  const conditions = [eq(posts.isDeleted, false)];

  if (communityId) {
    conditions.push(eq(posts.communityId, communityId));
  }

  if (cursor) {
    conditions.push(sql`${posts.id} < ${cursor}`);
  }

  const orderBy =
    sort === "hot"
      ? [desc(posts.hotScore), desc(posts.createdAt)]
      : sort === "top"
        ? [desc(posts.score), desc(posts.createdAt)]
        : [desc(posts.createdAt)];

  return db
    .select({
      post: posts,
      author: {
        userId: networkUsers.userId,
        userName: networkUsers.userName,
        userImageSrc: networkUsers.userImageSrc,
        experienceLevel: networkUsers.experienceLevel,
        isVerified: networkUsers.isVerified,
        karma: networkUsers.karma,
      },
      community: {
        id: communities.id,
        slug: communities.slug,
        name: communities.name,
        color: communities.color,
        iconSrc: communities.iconSrc,
      },
    })
    .from(posts)
    .innerJoin(networkUsers, eq(posts.userId, networkUsers.userId))
    .innerJoin(communities, eq(posts.communityId, communities.id))
    .where(and(...conditions))
    .orderBy(...orderBy)
    .limit(limit);
};

export const getPostById = cache(async (id: number) => {
  const [result] = await db
    .select({
      post: posts,
      author: {
        userId: networkUsers.userId,
        userName: networkUsers.userName,
        userImageSrc: networkUsers.userImageSrc,
        experienceLevel: networkUsers.experienceLevel,
        isVerified: networkUsers.isVerified,
        karma: networkUsers.karma,
      },
      community: {
        id: communities.id,
        slug: communities.slug,
        name: communities.name,
        color: communities.color,
        iconSrc: communities.iconSrc,
      },
    })
    .from(posts)
    .innerJoin(networkUsers, eq(posts.userId, networkUsers.userId))
    .innerJoin(communities, eq(posts.communityId, communities.id))
    .where(and(eq(posts.id, id), eq(posts.isDeleted, false)))
    .limit(1);
  return result ?? null;
});

// ==================== COMMENT QUERIES ====================

export const getCommentsForPost = cache(
  async (postId: number, sort: "best" | "new" | "old" = "best") => {
    const orderBy =
      sort === "best"
        ? [desc(comments.score), desc(comments.createdAt)]
        : sort === "new"
          ? [desc(comments.createdAt)]
          : [asc(comments.createdAt)];

    return db
      .select({
        comment: comments,
        author: {
          userId: networkUsers.userId,
          userName: networkUsers.userName,
          userImageSrc: networkUsers.userImageSrc,
          experienceLevel: networkUsers.experienceLevel,
          isVerified: networkUsers.isVerified,
        },
      })
      .from(comments)
      .innerJoin(networkUsers, eq(comments.userId, networkUsers.userId))
      .where(eq(comments.postId, postId))
      .orderBy(...orderBy);
  }
);

// ==================== VOTE QUERIES ====================

export const getUserVoteOnPost = cache(
  async (userId: string, postId: number) => {
    const [vote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, userId), eq(votes.postId, postId)))
      .limit(1);
    return vote ?? null;
  }
);

export const getUserVoteOnComment = cache(
  async (userId: string, commentId: number) => {
    const [vote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, userId), eq(votes.commentId, commentId)))
      .limit(1);
    return vote ?? null;
  }
);

export const getUserVotesOnPosts = async (
  userId: string,
  postIds: number[]
) => {
  if (postIds.length === 0) return [];
  return db
    .select()
    .from(votes)
    .where(
      and(
        eq(votes.userId, userId),
        sql`${votes.postId} IN (${sql.join(
          postIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      )
    );
};

// ==================== BOOKMARK QUERIES ====================

export const getUserBookmarks = cache(async (userId: string) => {
  return db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt));
});

export const isPostBookmarked = cache(
  async (userId: string, postId: number) => {
    const [bookmark] = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)))
      .limit(1);
    return !!bookmark;
  }
);

// ==================== NOTIFICATION QUERIES ====================

export const getUnreadNotificationCount = cache(async (userId: string) => {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );
  return result?.count ?? 0;
});

export const getNotifications = cache(
  async (userId: string, limit = 20) => {
    return db
      .select({
        notification: notifications,
        actor: {
          userId: networkUsers.userId,
          userName: networkUsers.userName,
          userImageSrc: networkUsers.userImageSrc,
        },
      })
      .from(notifications)
      .innerJoin(networkUsers, eq(notifications.actorId, networkUsers.userId))
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }
);

// ==================== SEARCH ====================

export const searchPosts = async (query: string, limit = 20) => {
  return db
    .select({
      post: posts,
      author: {
        userId: networkUsers.userId,
        userName: networkUsers.userName,
        userImageSrc: networkUsers.userImageSrc,
      },
      community: {
        id: communities.id,
        slug: communities.slug,
        name: communities.name,
        color: communities.color,
      },
    })
    .from(posts)
    .innerJoin(networkUsers, eq(posts.userId, networkUsers.userId))
    .innerJoin(communities, eq(posts.communityId, communities.id))
    .where(
      and(
        eq(posts.isDeleted, false),
        or(
          ilike(posts.title, `%${query}%`),
          ilike(posts.content, `%${query}%`)
        )
      )
    )
    .orderBy(desc(posts.score), desc(posts.createdAt))
    .limit(limit);
};
