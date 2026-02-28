"use client";

import { useState } from "react";
import Link from "next/link";
import { VoteButtons } from "@/components/vote/vote-buttons";
import { MarkdownRenderer } from "@/components/post/markdown-renderer";
import { CommentForm } from "@/components/comments/comment-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import { MessageSquare, Flag, MoreHorizontal } from "lucide-react";
import { useModal } from "@/stores/modal-store";
import { MAX_COMMENT_DEPTH } from "@/config/constants";

interface CommentData {
  comment: {
    id: number;
    postId: number;
    userId: string;
    parentId: number | null;
    content: string;
    depth: number;
    score: number;
    isDeleted: boolean;
    editedAt: string | Date | null;
    createdAt: string | Date;
  };
  author: {
    userId: string;
    userName: string;
    userImageSrc: string;
    experienceLevel: string;
    isVerified: boolean;
  };
  userVote?: "upvote" | "downvote" | null;
  children?: CommentData[];
}

interface CommentItemProps {
  data: CommentData;
  postAuthorId: string;
  onRefresh?: () => void;
}

export function CommentItem({ data, postAuthorId, onRefresh }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { onOpen } = useModal();

  const { comment, author, children } = data;
  const isOP = comment.userId === postAuthorId;
  const canReply = comment.depth < MAX_COMMENT_DEPTH && !comment.isDeleted;

  if (comment.isDeleted) {
    return (
      <div className="py-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="italic">[comentariu șters]</span>
          <span>• {timeAgo(comment.createdAt)}</span>
        </div>
        {children && children.length > 0 && (
          <div className="ml-4 pl-4 border-l border-white/5 mt-2 space-y-2">
            {children.map((child) => (
              <CommentItem
                key={child.comment.id}
                data={child}
                postAuthorId={postAuthorId}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-3 animate-fade-in">
      <div className="flex gap-3">
        {/* Vote */}
        <div className="flex flex-col items-center">
          <VoteButtons
            id={comment.id}
            type="comment"
            score={comment.score}
            userVote={data.userVote ?? null}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
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
              <span className="font-medium text-slate-300">
                {author.userName}
              </span>
              {author.isVerified && <span className="text-primary">✓</span>}
            </Link>
            {isOP && (
              <Badge
                variant="outline"
                className="text-[9px] border-primary/30 text-primary px-1.5 py-0"
              >
                OP
              </Badge>
            )}
            <span>{timeAgo(comment.createdAt)}</span>
            {comment.editedAt && <span className="text-slate-600">(editat)</span>}

            {/* Collapse toggle */}
            {children && children.length > 0 && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="text-slate-600 hover:text-slate-400 text-[10px]"
              >
                [{collapsed ? "+" : "-"}]
              </button>
            )}
          </div>

          {!collapsed && (
            <>
              {/* Body */}
              <MarkdownRenderer
                content={comment.content}
                className="text-sm"
              />

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                {canReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-slate-500 hover:text-white gap-1"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                  >
                    <MessageSquare className="h-3 w-3" />
                    Răspunde
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-slate-500 hover:text-emergency gap-1"
                  onClick={() =>
                    onOpen("report", { commentId: comment.id })
                  }
                >
                  <Flag className="h-3 w-3" />
                </Button>
              </div>

              {/* Reply form */}
              {showReplyForm && (
                <div className="mt-2">
                  <CommentForm
                    postId={comment.postId}
                    parentId={comment.id}
                    compact
                    placeholder={`Răspunde lui ${author.userName}...`}
                    onSuccess={() => {
                      setShowReplyForm(false);
                      onRefresh?.();
                    }}
                    onCancel={() => setShowReplyForm(false)}
                  />
                </div>
              )}

              {/* Children */}
              {children && children.length > 0 && (
                <div className="ml-2 pl-4 border-l border-white/5 mt-2 space-y-0">
                  {children.map((child) => (
                    <CommentItem
                      key={child.comment.id}
                      data={child}
                      postAuthorId={postAuthorId}
                      onRefresh={onRefresh}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
