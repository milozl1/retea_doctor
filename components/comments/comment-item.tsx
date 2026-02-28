"use client";

import { useState } from "react";
import Link from "next/link";
import { Reply, Edit, Trash2, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { VoteButtons } from "@/components/vote/vote-buttons";
import { MarkdownRenderer } from "@/components/post/markdown-renderer";
import { CommentForm } from "./comment-form";
import { timeAgo } from "@/lib/utils";
import { COMMENT_MAX_DEPTH } from "@/config/constants";

interface CommentData {
  comment: {
    id: number;
    postId: number;
    userId: string;
    parentId: number | null;
    content: string;
    depth: number;
    upvotes: number;
    downvotes: number;
    score: number;
    isDeleted: boolean;
    editedAt: string | null;
    createdAt: string | Date;
  };
  author: {
    userId: string;
    userName: string;
    userImageSrc: string;
    isVerified?: boolean;
  } | null;
  children?: CommentData[];
}

interface CommentItemProps {
  data: CommentData;
  postAuthorId: string;
  currentUserId?: string;
  onRefresh: () => void;
}

export function CommentItem({
  data,
  postAuthorId,
  currentUserId,
  onRefresh,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const { comment, author, children } = data;
  const isOP = comment.userId === postAuthorId;
  const isOwn = comment.userId === currentUserId;
  const canReply = comment.depth < COMMENT_MAX_DEPTH;

  if (comment.isDeleted) {
    return (
      <div className="py-2 text-slate-500 italic text-sm">
        [comentariu șters]
        {children && children.length > 0 && (
          <div className="ml-4 mt-2 pl-3 border-l border-white/10 space-y-3">
            {children.map((child) => (
              <CommentItem
                key={child.comment.id}
                data={child}
                postAuthorId={postAuthorId}
                currentUserId={currentUserId}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group">
      <div className="flex gap-3">
        {/* Vote */}
        <div className="flex-shrink-0 mt-0.5">
          <VoteButtons
            commentId={comment.id}
            upvotes={comment.upvotes}
            downvotes={comment.downvotes}
            score={comment.score}
            orientation="vertical"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author */}
          <div className="flex items-center gap-2 mb-1">
            {author && (
              <>
                <Avatar className="h-5 w-5">
                  <AvatarImage src={author.userImageSrc} />
                  <AvatarFallback className="text-[8px]">
                    {author.userName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Link
                  href={`/u/${author.userId}`}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {author.userName}
                </Link>
              </>
            )}
            {isOP && (
              <Badge className="text-[10px] bg-blue-500/20 text-blue-400 border-blue-500/30 py-0 px-1.5">
                OP
              </Badge>
            )}
            {author?.isVerified && (
              <span className="text-blue-400 text-xs">✓</span>
            )}
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(comment.createdAt)}
            </span>
            {comment.editedAt && (
              <span className="text-xs text-slate-600 italic">(editat)</span>
            )}
          </div>

          {/* Content */}
          <MarkdownRenderer content={comment.content} />

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canReply && currentUserId && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-400 transition-colors"
              >
                <Reply className="h-3 w-3" />
                Răspunde
              </button>
            )}
            {isOwn && (
              <>
                <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-yellow-400 transition-colors">
                  <Edit className="h-3 w-3" />
                  Editează
                </button>
                <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors">
                  <Trash2 className="h-3 w-3" />
                  Șterge
                </button>
              </>
            )}
          </div>

          {/* Reply form */}
          {isReplying && (
            <div className="mt-2">
              <CommentForm
                postId={comment.postId}
                parentId={comment.id}
                onSuccess={() => {
                  setIsReplying(false);
                  onRefresh();
                }}
                onCancel={() => setIsReplying(false)}
                placeholder="Scrie un răspuns..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {children && children.length > 0 && (
        <div className="ml-8 mt-3 pl-3 border-l border-white/10 space-y-3">
          {children.map((child) => (
            <CommentItem
              key={child.comment.id}
              data={child}
              postAuthorId={postAuthorId}
              currentUserId={currentUserId}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
