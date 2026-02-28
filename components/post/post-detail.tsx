"use client";

import Link from "next/link";
import { VoteButtons } from "@/components/vote/vote-buttons";
import { PostTypeBadge } from "@/components/post/post-type-badge";
import { MarkdownRenderer } from "@/components/post/markdown-renderer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  timeAgo,
  formatDate,
  formatNumber,
  EXPERIENCE_LABELS,
} from "@/lib/utils";
import {
  MessageSquare,
  Eye,
  Clock,
  Bookmark,
  Share2,
  Flag,
  ExternalLink,
  Lock,
  Pin,
} from "lucide-react";
import { toast } from "sonner";
import { useModal } from "@/stores/modal-store";

interface PostDetailProps {
  post: {
    id: number;
    title: string;
    content: string;
    type: string;
    score: number;
    commentCount: number;
    viewCount: number;
    createdAt: string | Date;
    editedAt: string | Date | null;
    tags: string[];
    isPinned: boolean;
    isLocked: boolean;
    linkUrl: string | null;
  };
  author: {
    userId: string;
    userName: string;
    userImageSrc: string;
    experienceLevel: string;
    isVerified: boolean;
    karma: number;
  };
  community: {
    id: number;
    slug: string;
    name: string;
    color: string;
  };
  userVote?: "upvote" | "downvote" | null;
}

export function PostDetail({
  post,
  author,
  community,
  userVote = null,
}: PostDetailProps) {
  const { onOpen } = useModal();

  return (
    <article className="glass-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap text-sm text-slate-500">
        <PostTypeBadge type={post.type} />
        <Link
          href={`/c/${community.slug}`}
          className="font-medium hover:text-primary transition-colors"
          style={{ color: community.color }}
        >
          c/{community.name}
        </Link>
        <span>•</span>
        <Link
          href={`/u/${author.userId}`}
          className="flex items-center gap-1.5 hover:text-white transition-colors"
        >
          <Avatar className="h-5 w-5">
            <AvatarImage src={author.userImageSrc} />
            <AvatarFallback className="text-[8px] bg-primary/20 text-primary">
              {author.userName[0]}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-slate-300">{author.userName}</span>
          {author.isVerified && <span className="text-primary">✓</span>}
        </Link>
        <Badge variant="outline" className="text-[10px] border-white/10 text-slate-500">
          {EXPERIENCE_LABELS[author.experienceLevel] || author.experienceLevel}
        </Badge>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeAgo(post.createdAt)}
        </span>
        {post.editedAt && (
          <span className="text-slate-600">(editat)</span>
        )}
        {post.isPinned && (
          <Badge variant="outline" className="text-clinical border-clinical/30 text-[10px]">
            <Pin className="h-3 w-3 mr-1" /> Fixat
          </Badge>
        )}
        {post.isLocked && (
          <Badge variant="outline" className="text-warning border-warning/30 text-[10px]">
            <Lock className="h-3 w-3 mr-1" /> Blocat
          </Badge>
        )}
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-white leading-tight">
        {post.title}
      </h1>

      {/* External link */}
      {post.linkUrl && (
        <a
          href={post.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm bg-primary/5 px-3 py-2 rounded-xl border border-primary/20 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          {post.linkUrl}
        </a>
      )}

      {/* Content */}
      {post.content && (
        <MarkdownRenderer content={post.content} />
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-slate-400 border border-white/5"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 pt-4 border-t border-white/5">
        <VoteButtons
          id={post.id}
          type="post"
          score={post.score}
          userVote={userVote}
          vertical={false}
        />

        <span className="flex items-center gap-1.5 text-sm text-slate-500">
          <MessageSquare className="h-4 w-4" />
          {post.commentCount} comentarii
        </span>

        <span className="flex items-center gap-1.5 text-sm text-slate-500">
          <Eye className="h-4 w-4" />
          {formatNumber(post.viewCount)} vizualizări
        </span>

        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-white gap-2"
            onClick={async () => {
              try {
                const res = await fetch("/api/bookmarks", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ postId: post.id }),
                });
                if (res.ok) toast.success("Postare salvată");
              } catch {
                toast.error("Eroare la salvare");
              }
            }}
          >
            <Bookmark className="h-4 w-4" />
            Salvează
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-white gap-2"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link copiat!");
            }}
          >
            <Share2 className="h-4 w-4" />
            Distribuie
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-emergency-500 gap-2"
            onClick={() => onOpen("report", { postId: post.id })}
          >
            <Flag className="h-4 w-4" />
            Raportează
          </Button>
        </div>
      </div>
    </article>
  );
}
