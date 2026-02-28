import {
  pgTable,
  pgEnum,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

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

export const userRoleEnum = pgEnum("user_role", [
  "user",
  "moderator",
  "admin",
]);

// ==================== NETWORK USERS ====================

export const networkUsers = pgTable("network_users", {
  userId: text("user_id").primaryKey(),
  userName: text("user_name").notNull(),
  userImageSrc: text("user_image_src").notNull().default("/default-avatar.png"),
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

export const communities = pgTable(
  "communities",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    rules: text("rules").notNull().default(""),
    iconSrc: text("icon_src"),
    color: text("color").notNull().default("#2196F3"),
    specializationId: integer("specialization_id"),
    memberCount: integer("member_count").notNull().default(0),
    postCount: integer("post_count").notNull().default(0),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("communities_slug_idx").on(table.slug),
  })
);

// ==================== COMMUNITY MEMBERSHIPS ====================

export const communityMemberships = pgTable(
  "community_memberships",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => networkUsers.userId, { onDelete: "cascade" }),
    communityId: integer("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    role: text("membership_role").notNull().default("member"),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
  },
  (table) => ({
    userCommunityIdx: uniqueIndex("membership_user_community_idx").on(
      table.userId,
      table.communityId
    ),
    communityIdx: index("membership_community_idx").on(table.communityId),
  })
);

// ==================== POSTS ====================

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => networkUsers.userId, { onDelete: "cascade" }),
    communityId: integer("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull().default(""),
    type: postTypeEnum("type").notNull().default("discussion"),
    linkUrl: text("link_url"),
    imageSrc: text("image_src"),
    caseStudyId: integer("case_study_id"),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    upvotes: integer("upvotes").notNull().default(0),
    downvotes: integer("downvotes").notNull().default(0),
    score: integer("score").notNull().default(0),
    hotScore: integer("hot_score").notNull().default(0),
    commentCount: integer("comment_count").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    isPinned: boolean("is_pinned").notNull().default(false),
    isLocked: boolean("is_locked").notNull().default(false),
    isDeleted: boolean("is_deleted").notNull().default(false),
    editedAt: timestamp("edited_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    communityCreatedIdx: index("posts_community_created_idx").on(
      table.communityId,
      table.createdAt
    ),
    userIdx: index("posts_user_idx").on(table.userId),
    scoreCreatedIdx: index("posts_score_created_idx").on(
      table.score,
      table.createdAt
    ),
  })
);

// ==================== COMMENTS ====================

export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => networkUsers.userId, { onDelete: "cascade" }),
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
  (table) => ({
    postCreatedIdx: index("comments_post_created_idx").on(
      table.postId,
      table.createdAt
    ),
    userIdx: index("comments_user_idx").on(table.userId),
    parentIdx: index("comments_parent_idx").on(table.parentId),
  })
);

// ==================== VOTES ====================

export const votes = pgTable(
  "votes",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => networkUsers.userId, { onDelete: "cascade" }),
    postId: integer("post_id").references(() => posts.id, {
      onDelete: "cascade",
    }),
    commentId: integer("comment_id").references(() => comments.id, {
      onDelete: "cascade",
    }),
    type: voteTypeEnum("type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userPostIdx: uniqueIndex("votes_user_post_idx")
      .on(table.userId, table.postId)
      .where(sql`post_id IS NOT NULL`),
    userCommentIdx: uniqueIndex("votes_user_comment_idx")
      .on(table.userId, table.commentId)
      .where(sql`comment_id IS NOT NULL`),
  })
);

// ==================== BOOKMARKS ====================

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => networkUsers.userId, { onDelete: "cascade" }),
    postId: integer("post_id").references(() => posts.id, {
      onDelete: "cascade",
    }),
    commentId: integer("comment_id").references(() => comments.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userPostIdx: uniqueIndex("bookmarks_user_post_idx").on(
      table.userId,
      table.postId
    ),
    userCommentIdx: uniqueIndex("bookmarks_user_comment_idx").on(
      table.userId,
      table.commentId
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
      .references(() => networkUsers.userId, { onDelete: "cascade" }),
    actorId: text("actor_id")
      .notNull()
      .references(() => networkUsers.userId, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    postId: integer("post_id").references(() => posts.id, {
      onDelete: "cascade",
    }),
    commentId: integer("comment_id").references(() => comments.id, {
      onDelete: "cascade",
    }),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userReadCreatedIdx: index("notifications_user_read_created_idx").on(
      table.userId,
      table.isRead,
      table.createdAt
    ),
    userCreatedIdx: index("notifications_user_created_idx").on(
      table.userId,
      table.createdAt
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
      .references(() => networkUsers.userId, { onDelete: "cascade" }),
    postId: integer("post_id").references(() => posts.id, {
      onDelete: "cascade",
    }),
    commentId: integer("comment_id").references(() => comments.id, {
      onDelete: "cascade",
    }),
    reason: text("reason").notNull(),
    details: text("details"),
    status: reportStatusEnum("status").notNull().default("pending"),
    resolvedBy: text("resolved_by"),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    statusCreatedIdx: index("reports_status_created_idx").on(
      table.status,
      table.createdAt
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
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id"),
    viewedAt: timestamp("viewed_at").notNull().defaultNow(),
  },
  (table) => ({
    postUserIdx: uniqueIndex("post_views_post_user_idx").on(
      table.postId,
      table.userId
    ),
  })
);

// ==================== RELATIONS ====================

export const networkUsersRelations = relations(networkUsers, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  votes: many(votes),
  bookmarks: many(bookmarks),
  notifications: many(notifications, { relationName: "recipient" }),
  actedNotifications: many(notifications, { relationName: "actor" }),
  memberships: many(communityMemberships),
  reports: many(reports),
}));

export const communitiesRelations = relations(communities, ({ many }) => ({
  posts: many(posts),
  memberships: many(communityMemberships),
}));

export const communityMembershipsRelations = relations(
  communityMemberships,
  ({ one }) => ({
    user: one(networkUsers, {
      fields: [communityMemberships.userId],
      references: [networkUsers.userId],
    }),
    community: one(communities, {
      fields: [communityMemberships.communityId],
      references: [communities.id],
    }),
  })
);

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
  views: many(postViews),
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

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(networkUsers, {
    fields: [votes.userId],
    references: [networkUsers.userId],
  }),
  post: one(posts, {
    fields: [votes.postId],
    references: [posts.id],
  }),
  comment: one(comments, {
    fields: [votes.commentId],
    references: [comments.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(networkUsers, {
    fields: [bookmarks.userId],
    references: [networkUsers.userId],
  }),
  post: one(posts, {
    fields: [bookmarks.postId],
    references: [posts.id],
  }),
  comment: one(comments, {
    fields: [bookmarks.commentId],
    references: [comments.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(networkUsers, {
    fields: [notifications.userId],
    references: [networkUsers.userId],
    relationName: "recipient",
  }),
  actor: one(networkUsers, {
    fields: [notifications.actorId],
    references: [networkUsers.userId],
    relationName: "actor",
  }),
  post: one(posts, {
    fields: [notifications.postId],
    references: [posts.id],
  }),
  comment: one(comments, {
    fields: [notifications.commentId],
    references: [comments.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(networkUsers, {
    fields: [reports.reporterId],
    references: [networkUsers.userId],
  }),
  post: one(posts, {
    fields: [reports.postId],
    references: [posts.id],
  }),
  comment: one(comments, {
    fields: [reports.commentId],
    references: [comments.id],
  }),
}));

export const postViewsRelations = relations(postViews, ({ one }) => ({
  post: one(posts, {
    fields: [postViews.postId],
    references: [posts.id],
  }),
}));
