"use client";

import Link from "next/link";
import { MessageSquare, Eye, Clock, Bookmark, MoreHorizontal, Flag, Share2, ArrowUpRight } from "lucide-react";
import { VoteButtons } from "@/components/vote/vote-buttons";
import { PostTypeBadge } from "@/components/post/post-type-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn, timeAgo, truncate, formatNumber, EXPERIENCE_LABELS } from "@/lib/utils";
import { stripMarkdown } from "@/lib/markdown";
import { toast } from "sonner";
import { useModal } from "@/stores/modal-store";

interface PostCardProps {
  post: {
    id: number;
    title: string;
    content: string;
    type: string;
    score: number;
    commentCount: number;
    viewCount: number;
    createdAt: string | Date;
    tags: string[];
    isPinned: boolean;
  };
  author: {
    userId: string;
    userName: string;
    userImageSrc: string;
    experienceLevel: string;
    isVerified: boolean;
  };
  community: {
    id: number;
    slug: string;
    name: string;
    color: string;
  };
  userVote?: "upvote" | "downvote" | null;
  showCommunity?: boolean;
}

export function PostCard({
  post,
  author,
  community,
  userVote = null,
  showCommunity = true,
}: PostCardProps) {
  const { onOpen } = useModal();
  const previewText = truncate(stripMarkdown(post.content), 180);

  const handleBookmark = async () => {
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });
      if (res.ok) {
        toast.success("Postare salvată");
      } else {
        toast.error("Nu s-a putut salva postarea");
      }
    } catch {
      toast.error("Eroare la salvare");
    }
  };

  return (
    <article className="group glass-card-hover p-0 overflow-hidden animate-fade-in">
      {/* Pinned indicator */}
      {post.isPinned && (
        <div className="px-4 py-1.5 bg-gradient-to-r from-primary/[0.08] to-transparent border-b border-primary/10">
          <span className="text-[11px] font-medium text-primary/80">📌 Postare fixată</span>
        </div>
      )}

      <div className="flex">
        {/* Vote sidebar */}
        <div className="hidden sm:flex flex-col items-center py-4 px-3 border-r border-white/[0.04] bg-white/[0.01]">
          <VoteButtons
            id={post.id}
            type="post"
            score={post.score}
            userVote={userVote}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 p-4 space-y-2.5">
          {/* Meta line */}
          <div className="flex items-center gap-2 flex-wrap">
            <PostTypeBadge type={post.type} />
            
            {showCommunity && (
              <Link
                href={`/c/${community.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors group/comm"
              >
                <span
                  className="w-4 h-4 rounded flex items-center justify-center text-[8px]"
                  style={{ backgroundColor: community.color + "25", border: `1px solid ${community.color}30` }}
                >
                  •
                </span>
                <span>c/<span className="group-hover/comm:text-primary transition-colors" style={{ color: community.color }}>{community.name}</span></span>
              </Link>
            )}

            <span className="text-slate-600">·</span>

            <Link
              href={`/u/${author.userId}`}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Avatar className="h-4 w-4">
                <AvatarImage src={author.userImageSrc} />
                <AvatarFallback className="text-[7px] bg-primary/20 text-primary">
                  {author.userName[0]}
                </AvatarFallback>
              </Avatar>
              <span>{author.userName}</span>
              {author.isVerified && (
                <span className="text-primary text-[10px]" title="Verificat">✓</span>
              )}
            </Link>

            <span className="text-slate-600">·</span>

            <span className="text-xs text-slate-600 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(post.createdAt)}
            </span>
          </div>

          {/* Title */}
          <Link href={`/post/${post.id}`} className="block group/title">
            <h3 className="text-[15px] font-semibold text-slate-100 group-hover/title:text-primary transition-colors duration-200 leading-snug">
              {post.title}
            </h3>
          </Link>

          {/* Preview */}
          {previewText && (
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
              {previewText}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap pt-0.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium text-slate-500 bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.08] hover:text-slate-400 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer stats */}
          <div className="flex items-center gap-1 pt-1">
            <Link
              href={`/post/${post.id}`}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary px-2 py-1 rounded-md hover:bg-primary/[0.06] transition-all"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="font-medium">{post.commentCount}</span>
              <span className="hidden sm:inline text-slate-600">comentarii</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 px-2 py-1">
              <Eye className="h-3.5 w-3.5" />
              {formatNumber(post.viewCount)}
            </span>

            {/* Mobile votes */}
            <div className="sm:hidden ml-auto">
              <VoteButtons
                id={post.id}
                type="post"
                score={post.score}
                userVote={userVote}
                vertical={false}
              />
            </div>

            {/* Actions */}
            <div className="hidden sm:flex items-center gap-0.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-600 hover:text-primary hover:bg-primary/[0.06] rounded-lg"
                onClick={handleBookmark}
              >
                <Bookmark className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-600 hover:text-slate-300 hover:bg-white/[0.04] rounded-lg"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/post/${post.id}`
                  );
                  toast.success("Link copiat!");
                }}
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-600 hover:text-slate-300 hover:bg-white/[0.04] rounded-lg"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#0c1222]/95 backdrop-blur-2xl border-white/[0.08] shadow-2xl rounded-xl p-1 min-w-[160px]">
                  <DropdownMenuItem
                    className="text-slate-300 cursor-pointer rounded-lg text-sm gap-2 px-3 py-2"
                    onClick={() => onOpen("report", { postId: post.id })}
                  >
                    <Flag className="h-3.5 w-3.5 text-slate-500" />
                    Raportează
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
