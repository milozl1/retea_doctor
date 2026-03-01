import { requireAuth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { bookmarks, posts, networkUsers, communities } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { PostTypeBadge } from "@/components/post/post-type-badge";
import { MessageSquare, ArrowBigUp, Clock, BookmarkX } from "lucide-react";
import { timeAgo, formatNumber, truncate } from "@/lib/utils";

export default async function SavedPage() {
  const { userId } = await requireAuth();

  const savedPosts = await db
    .select({
      bookmark: bookmarks,
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
    .from(bookmarks)
    .innerJoin(posts, eq(bookmarks.postId, posts.id))
    .innerJoin(networkUsers, eq(posts.userId, networkUsers.userId))
    .innerJoin(communities, eq(posts.communityId, communities.id))
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt));

  return (
    <div className="space-y-4">
      <div className="glass p-6">
        <h1 className="text-xl font-bold text-white mb-1">
          🔖 Postări salvate
        </h1>
        <p className="text-gray-400 text-sm">
          Postările pe care le-ai salvat pentru mai târziu.
        </p>
      </div>

      {savedPosts.length > 0 ? (
        <div className="space-y-3">
          {savedPosts.map(({ post, author, community }) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="block glass p-4 glass-hover"
            >
              <div className="flex items-center gap-2 mb-2">
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
                <span className="text-xs text-gray-500">
                  de {author.userName}
                </span>
              </div>
              <h3 className="text-sm font-medium text-white mb-1">
                {post.title}
              </h3>
              {post.content && (
                <p className="text-xs text-gray-400 line-clamp-2">
                  {truncate(post.content, 150)}
                </p>
              )}
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
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass p-12 text-center">
          <BookmarkX className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">
            Nu ai salvat nicio postare încă.
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Apasă pe iconița de bookmark pentru a salva postări.
          </p>
        </div>
      )}
    </div>
  );
}
