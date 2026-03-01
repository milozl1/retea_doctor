import { notFound } from "next/navigation";
import { getNetworkUser } from "@/db/queries";
import { db } from "@/db/drizzle";
import { posts, communities, networkUsers, comments, follows } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { ProfileHeader } from "@/components/profile/profile-header";
import { FollowButton } from "@/components/profile/follow-button";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { PostTypeBadge } from "@/components/post/post-type-badge";
import { MessageSquare, ArrowBigUp, Clock, Settings, Mail } from "lucide-react";
import { timeAgo, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MedlearnStats } from "@/components/profile/medlearn-stats";

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: { userId: string };
  searchParams: { tab?: string };
}) {
  const user = await getNetworkUser(params.userId);
  if (!user) {
    notFound();
  }

  const { userId: currentUserId } = await auth();
  const isOwnProfile = currentUserId === params.userId;
  const tab = searchParams.tab || "posts";

  // Get follow counts and status
  const [[followersResult], [followingResult]] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(follows)
      .where(eq(follows.followingId, params.userId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(follows)
      .where(eq(follows.followerId, params.userId)),
  ]);

  let isFollowing = false;
  if (currentUserId && !isOwnProfile) {
    const [existingFollow] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, currentUserId),
          eq(follows.followingId, params.userId)
        )
      )
      .limit(1);
    isFollowing = !!existingFollow;
  }

  // Get user's posts
  const userPosts = tab === "posts" ? await db
    .select({
      post: posts,
      community: {
        id: communities.id,
        slug: communities.slug,
        name: communities.name,
        color: communities.color,
      },
    })
    .from(posts)
    .innerJoin(communities, eq(posts.communityId, communities.id))
    .where(and(eq(posts.userId, params.userId), eq(posts.isDeleted, false)))
    .orderBy(desc(posts.createdAt))
    .limit(20) : [];

  // Get user's comments
  const userComments = tab === "comments" ? await db
    .select({
      comment: comments,
      postTitle: posts.title,
      postId: posts.id,
    })
    .from(comments)
    .innerJoin(posts, eq(comments.postId, posts.id))
    .where(and(eq(comments.userId, params.userId), eq(comments.isDeleted, false)))
    .orderBy(desc(comments.createdAt))
    .limit(30) : [];

  const followersCount = followersResult?.count ?? 0;
  const followingCount = followingResult?.count ?? 0;

  return (
    <div className="space-y-4">
      <ProfileHeader
        user={user}
        followersCount={followersCount}
        followingCount={followingCount}
      />

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {isOwnProfile ? (
          <Link href="/settings">
            <Button size="sm" variant="outline" className="border-white/10 text-slate-300 hover:text-white gap-2">
              <Settings className="h-4 w-4" />
              Editează profilul
            </Button>
          </Link>
        ) : currentUserId ? (
          <>
            <FollowButton
              targetUserId={params.userId}
              initialIsFollowing={isFollowing}
              initialFollowersCount={followersCount}
            />
            <Link href={`/messages?new=${params.userId}`}>
              <Button size="sm" variant="outline" className="border-white/10 text-slate-300 hover:text-white gap-2">
                <Mail className="h-4 w-4" />
                Mesaj
              </Button>
            </Link>
          </>
        ) : null}
      </div>

      {/* MedLearn cross-app stats (visible only when MEDLEARN_DATABASE_URL is set) */}
      <MedlearnStats userId={params.userId} />

      {/* Tabs */}
      <div className="flex gap-1 glass-card p-1">
        <Link
          href={`/u/${params.userId}?tab=posts`}
          className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "posts"
              ? "bg-white/[0.08] text-white"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Postări ({user.postCount})
        </Link>
        <Link
          href={`/u/${params.userId}?tab=comments`}
          className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "comments"
              ? "bg-white/[0.08] text-white"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Comentarii ({user.commentCount})
        </Link>
      </div>

      {/* Tab Content */}
      {tab === "posts" ? (
        <div className="glass-card p-4">
          {userPosts.length > 0 ? (
            <div className="space-y-3">
              {userPosts.map(({ post, community }) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="block glass-sm p-4 glass-hover"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <PostTypeBadge type={post.type} />
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: community.color + "20",
                            color: community.color,
                          }}
                        >
                          {community.name}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-white truncate">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <ArrowBigUp className="h-3 w-3" />
                          {formatNumber(post.score)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.commentCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo(post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">
              Nicio postare încă.
            </p>
          )}
        </div>
      ) : (
        <div className="glass-card p-4">
          {userComments.length > 0 ? (
            <div className="space-y-3">
              {userComments.map(({ comment, postTitle, postId }) => (
                <Link
                  key={comment.id}
                  href={`/post/${postId}`}
                  className="block glass-sm p-4 glass-hover"
                >
                  <p className="text-xs text-slate-500 mb-1">
                    Re: <span className="text-slate-300">{postTitle}</span>
                  </p>
                  <p className="text-sm text-slate-300 line-clamp-2">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <ArrowBigUp className="h-3 w-3" />
                      {comment.score}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(comment.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">
              Niciun comentariu încă.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
