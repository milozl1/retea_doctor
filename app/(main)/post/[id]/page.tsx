import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db/drizzle";
import { posts, networkUsers, communities } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { VoteButtons } from "@/components/vote/vote-buttons";
import { PostTypeBadge } from "@/components/post/post-type-badge";
import { MarkdownRenderer } from "@/components/post/markdown-renderer";
import { CommentTree } from "@/components/comments/comment-tree";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate, timeAgo } from "@/lib/utils";
import { currentUser } from "@/lib/auth";
import { ExternalLink, Lock } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPost(id: number) {
  try {
    const [result] = await db
      .select({
        post: posts,
        author: {
          userId: networkUsers.userId,
          userName: networkUsers.userName,
          userImageSrc: networkUsers.userImageSrc,
          karma: networkUsers.karma,
          isVerified: networkUsers.isVerified,
          experienceLevel: networkUsers.experienceLevel,
        },
        community: {
          id: communities.id,
          slug: communities.slug,
          name: communities.name,
          color: communities.color,
        },
      })
      .from(posts)
      .leftJoin(networkUsers, eq(posts.userId, networkUsers.userId))
      .leftJoin(communities, eq(posts.communityId, communities.id))
      .where(and(eq(posts.id, id), eq(posts.isDeleted, false)))
      .limit(1);
    return result;
  } catch {
    return null;
  }
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const postId = parseInt(id);
  if (isNaN(postId)) notFound();

  const result = await getPost(postId);
  if (!result) notFound();

  const { post, author, community } = result;
  const user = await currentUser();

  return (
    <div className="space-y-6">
      {/* Post */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex gap-4">
          {/* Vote */}
          <div className="flex-shrink-0">
            <VoteButtons
              postId={post.id}
              upvotes={post.upvotes}
              downvotes={post.downvotes}
              score={post.score}
              orientation="vertical"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Meta */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <PostTypeBadge type={post.type as "case_study" | "discussion" | "article" | "quick_question" | "external_link"} />
              {community && (
                <Link
                  href={`/c/${community.slug}`}
                  className="text-sm font-medium hover:underline"
                  style={{ color: community.color }}
                >
                  c/{community.name}
                </Link>
              )}
              {post.isPinned && (
                <Badge className="text-xs bg-green-500/20 text-green-400">
                  📌 Fixat
                </Badge>
              )}
              {post.isLocked && (
                <Badge className="text-xs bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Blocat
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold text-white mb-3">
              {post.title}
              {post.type === "external_link" && post.linkUrl && (
                <a
                  href={post.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-base"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </h1>

            {/* Content */}
            {post.content && (
              <div className="mb-4">
                <MarkdownRenderer content={post.content} />
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author */}
            {author && (
              <div className="flex items-center gap-2 text-sm text-slate-400 border-t border-white/5 pt-3">
                <Link
                  href={`/u/${author.userId}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={author.userImageSrc} />
                    <AvatarFallback className="text-[10px] bg-blue-600">
                      {author.userName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{author.userName}</span>
                  {author.isVerified && (
                    <span className="text-blue-400">✓</span>
                  )}
                </Link>
                <span>•</span>
                <span title={formatDate(post.createdAt)}>
                  {timeAgo(post.createdAt)}
                </span>
                {post.editedAt && (
                  <span className="italic text-slate-500">
                    (editat {timeAgo(post.editedAt)})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">
          Comentarii ({post.commentCount})
        </h2>
        <CommentTree
          postId={post.id}
          postAuthorId={post.userId}
          currentUserId={user?.id}
        />
      </div>
    </div>
  );
}
