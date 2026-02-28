import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  serial,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== ENUMS ====================
export const postTypeEnum = pgEnum("post_type", [
  "case_study",
  "discussion",
  "article",
  "quick_question",
  "external_link",
]);

export const voteTypeEnum = pgEnum("vote_type", ["upvote", "downvote"]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "reviewed",
  "resolved",
  "dismissed",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "reply_post",
  "reply_comment",
  "upvote",
  "mention",
  "new_post_community",
]);

export const userRoleEnum = pgEnum("user_role", ["user", "moderator", "admin"]);

// ==================== NETWORK USERS ====================
export const networkUsers = pgTable("network_users", {
  userId: text("user_id").primaryKey(),
  userName: text("user_name").notNull(),
  userImageSrc: text("user_image_src").notNull().default(""),
  bio: text("bio"),
  specialization: text("specialization"),
  experienceLevel: text("experience_level").notNull().default("student"),
  karma: integer("karma").notNull().default(0),
  role: userRoleEnum("role").notNull().default("user"),
  isVerified: boolean("is_verified").notNull().default(false),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
  postCount: integer("post_count").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
});

// ==================== COMMUNITIES ====================
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  rules: text("rules").notNull().default(""),
  iconSrc: text("icon_src"),
  color: text("color").notNull().default("#2196F3"),
  specializationId: integer("specialization_id"),
  memberCount: integer("member_count").notNull().default(0),
  postCount: integer("post_count").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ==================== COMMUNITY MEMBERSHIPS ====================
export const communityMemberships = pgTable(
  "community_memberships",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => networkUsers.userId),
    communityId: integer("community_id")
      .notNull()
      .references(() => communities.id),
    role: text("role").notNull().default("member"),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
  },
  (t) => ({
    userCommunityUnique: uniqueIndex("community_memberships_user_community_unique").on(
      t.userId,
      t.communityId
    ),
    communityIdx: index("community_memberships_community_idx").on(t.communityId),
  })
);

// ==================== POSTS ====================
export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => networkUsers.userId),
    communityId: integer("community_id")
      .notNull()
      .references(() => communities.id),
    title: text("title").notNull(),
    content: text("content").notNull().default(""),
    type: postTypeEnum("type").notNull().default("discussion"),
    linkUrl: text("link_url"),
    imageSrc: text("image_src"),
    caseStudyId: integer("case_study_id"),
    tags: text("tags").array().notNull().default([]),
    upvotes: integer("upvotes").notNull().default(0),
    downvotes: integer("downvotes").notNull().default(0),
    score: integer("score").notNull().default(0),
    commentCount: integer("comment_count").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    isPinned: boolean("is_pinned").notNull().default(false),
    isLocked: boolean("is_locked").notNull().default(false),
    isDeleted: boolean("is_deleted").notNull().default(false),
    editedAt: timestamp("edited_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    communityCreatedIdx: index("posts_community_created_idx").on(
      t.communityId,
      t.createdAt
    ),
    userIdx: index("posts_user_idx").on(t.userId),
    scoreCreatedIdx: index("posts_score_created_idx").on(t.score, t.createdAt),
  })
);

// ==================== COMMENTS ====================
export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id),
    userId: text("user_id")
      .notNull()
      .references(() => networkUsers.userId),
    parentId: integer("parent_id"),
    content: text("content").notNull(),
    depth: integer("depth").notNull().default(0),
    upvotes: integer("upvotes").notNull().default(0),
    downvotes: integer("downvotes").notNull().default(0),
    score: integer("score").notNull().default(0),
    isDeleted: boolean("is_deleted").notNull().default(false),
    editedAt: timestamp("edited_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    postCreatedIdx: index("comments_post_created_idx").on(t.postId, t.createdAt),
    userIdx: index("comments_user_idx").on(t.userId),
    parentIdx: index("comments_parent_idx").on(t.parentId),
  })
);

// ==================== VOTES ====================
export const votes = pgTable(
  "votes",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => networkUsers.userId),
    postId: integer("post_id").references(() => posts.id),
    commentId: integer("comment_id").references(() => comments.id),
    type: voteTypeEnum("type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    userPostUnique: uniqueIndex("votes_user_post_unique").on(t.userId, t.postId),
    userCommentUnique: uniqueIndex("votes_user_comment_unique").on(
      t.userId,
      t.commentId
    ),
  })
);

// ==================== BOOKMARKS ====================
export const bookmarks = pgTable(
  "bookmarks",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => networkUsers.userId),
    postId: integer("post_id").references(() => posts.id),
    commentId: integer("comment_id").references(() => comments.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    userPostUnique: uniqueIndex("bookmarks_user_post_unique").on(
      t.userId,
      t.postId
    ),
    userCommentUnique: uniqueIndex("bookmarks_user_comment_unique").on(
      t.userId,
      t.commentId
    ),
  })
);

// ==================== NOTIFICATIONS ====================
export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => networkUsers.userId),
    actorId: text("actor_id")
      .notNull()
      .references(() => networkUsers.userId),
    type: notificationTypeEnum("type").notNull(),
    postId: integer("post_id").references(() => posts.id),
    commentId: integer("comment_id").references(() => comments.id),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    userReadCreatedIdx: index("notifications_user_read_created_idx").on(
      t.userId,
      t.isRead,
      t.createdAt
    ),
    userCreatedIdx: index("notifications_user_created_idx").on(
      t.userId,
      t.createdAt
    ),
  })
);

// ==================== REPORTS ====================
export const reports = pgTable(
  "reports",
  {
    id: serial("id").primaryKey(),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => networkUsers.userId),
    postId: integer("post_id").references(() => posts.id),
    commentId: integer("comment_id").references(() => comments.id),
    reason: text("reason").notNull(),
    details: text("details"),
    status: reportStatusEnum("status").notNull().default("pending"),
    resolvedBy: text("resolved_by").references(() => networkUsers.userId),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    statusCreatedIdx: index("reports_status_created_idx").on(
      t.status,
      t.createdAt
    ),
  })
);

// ==================== POST VIEWS ====================
export const postViews = pgTable(
  "post_views",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id),
    userId: text("user_id").references(() => networkUsers.userId),
    viewedAt: timestamp("viewed_at").notNull().defaultNow(),
  },
  (t) => ({
    postUserUnique: uniqueIndex("post_views_post_user_unique").on(
      t.postId,
      t.userId
    ),
  })
);

// ==================== RELATIONS ====================
export const networkUsersRelations = relations(networkUsers, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  votes: many(votes),
  bookmarks: many(bookmarks),
  memberships: many(communityMemberships),
  notifications: many(notifications),
  reports: many(reports),
}));

export const communitiesRelations = relations(communities, ({ many }) => ({
  posts: many(posts),
  memberships: many(communityMemberships),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(networkUsers, {
    fields: [posts.userId],
    references: [networkUsers.userId],
  }),
  community: one(communities, {
    fields: [posts.communityId],
    references: [communities.id],
  }),
  comments: many(comments),
  votes: many(votes),
  bookmarks: many(bookmarks),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(networkUsers, {
    fields: [comments.userId],
    references: [networkUsers.userId],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "parentChild",
  }),
  children: many(comments, { relationName: "parentChild" }),
  votes: many(votes),
}));
