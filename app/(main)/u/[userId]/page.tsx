import { notFound } from "next/navigation";
import { getNetworkUser } from "@/db/queries";
import { db } from "@/db/drizzle";
import { posts, communities, networkUsers } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { ProfileHeader } from "@/components/profile/profile-header";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { PostTypeBadge } from "@/components/post/post-type-badge";
import { MessageSquare, ArrowBigUp, Clock } from "lucide-react";
import { timeAgo, formatNumber } from "@/lib/utils";

export default async function UserProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const user = await getNetworkUser(params.userId);
  if (!user) {
    notFound();
  }

  const { userId: currentUserId } = await auth();

  const userPosts = await db
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
    .limit(20);

  return (
    <div className="space-y-4">
      <ProfileHeader user={user} />

      <div className="glass p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4">
          Postări recente
        </h3>

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
    </div>
  );
}
