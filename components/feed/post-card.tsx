import Link from "next/link";
import { MessageSquare, Eye, Clock, ExternalLink } from "lucide-react";
import { VoteButtons } from "@/components/vote/vote-buttons";
import { PostTypeBadge } from "@/components/post/post-type-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { timeAgo, formatNumber } from "@/lib/utils";
import { truncateMarkdown } from "@/lib/markdown";

interface PostCardProps {
  post: {
    id: number;
    title: string;
    content: string;
    type: string;
    linkUrl: string | null;
    tags: string[];
    upvotes: number;
    downvotes: number;
    score: number;
    commentCount: number;
    viewCount: number;
    isPinned: boolean;
    createdAt: string | Date;
  };
  author: {
    userId: string;
    userName: string;
    userImageSrc: string;
    karma?: number;
    isVerified?: boolean;
  } | null;
  community: {
    id: number;
    slug: string;
    name: string;
    color: string;
  } | null;
  userVote?: "upvote" | "downvote" | null;
}

export function PostCard({ post, author, community, userVote = null }: PostCardProps) {
  const preview = truncateMarkdown(post.content, 200);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors">
      <div className="flex gap-3">
        {/* Vote buttons */}
        <div className="flex-shrink-0">
          <VoteButtons
            postId={post.id}
            upvotes={post.upvotes}
            downvotes={post.downvotes}
            score={post.score}
            userVote={userVote}
            orientation="vertical"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top meta */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <PostTypeBadge type={post.type as "case_study" | "discussion" | "article" | "quick_question" | "external_link"} />
            {community && (
              <Link
                href={`/c/${community.slug}`}
                className="text-xs font-medium hover:underline"
                style={{ color: community.color }}
              >
                c/{community.name}
              </Link>
            )}
            {post.isPinned && (
              <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                📌 Fixat
              </Badge>
            )}
          </div>

          {/* Title */}
          <Link href={`/post/${post.id}`}>
            <h2 className="text-white font-semibold text-base hover:text-blue-400 transition-colors line-clamp-2 mb-1">
              {post.title}
              {post.type === "external_link" && post.linkUrl && (
                <ExternalLink className="inline ml-1 h-3.5 w-3.5 opacity-60" />
              )}
            </h2>
          </Link>

          {/* Preview */}
          {preview && (
            <p className="text-slate-400 text-sm line-clamp-2 mb-2">{preview}</p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-2">
              {post.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Bottom meta */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {author && (
              <Link
                href={`/u/${author.userId}`}
                className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
              >
                <Avatar className="h-4 w-4">
                  <AvatarImage src={author.userImageSrc} />
                  <AvatarFallback className="text-[8px]">
                    {author.userName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{author.userName}</span>
                {author.isVerified && <span className="text-blue-400">✓</span>}
              </Link>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(post.createdAt)}
            </span>
            <Link
              href={`/post/${post.id}#comentarii`}
              className="flex items-center gap-1 hover:text-slate-300 transition-colors"
            >
              <MessageSquare className="h-3 w-3" />
              {formatNumber(post.commentCount)} comentarii
            </Link>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatNumber(post.viewCount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
