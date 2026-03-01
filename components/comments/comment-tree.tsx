"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { CommentItem } from "./comment-item";
import { CommentForm } from "./comment-form";
import { MessageSquare } from "lucide-react";

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

interface CommentTreeProps {
  comments: CommentData[];
  postId: number;
  postAuthorId: string;
  currentUserId?: string | null;
  isLocked?: boolean;
}

function buildTree(comments: CommentData[]): CommentData[] {
  const map = new Map<number, CommentData>();
  const roots: CommentData[] = [];

  // Initialize all comments with empty children
  comments.forEach((c) => {
    map.set(c.comment.id, { ...c, children: [] });
  });

  // Build tree
  comments.forEach((c) => {
    const node = map.get(c.comment.id)!;
    if (c.comment.parentId && map.has(c.comment.parentId)) {
      const parent = map.get(c.comment.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function CommentTree({
  comments,
  postId,
  postAuthorId,
  currentUserId,
  isLocked = false,
}: CommentTreeProps) {
  const router = useRouter();

  const tree = useMemo(() => buildTree(comments), [comments]);

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Comment form */}
      {!isLocked && (
        <div className="mb-4">
          <CommentForm
            postId={postId}
            onSuccess={handleRefresh}
          />
        </div>
      )}

      {isLocked && (
        <div className="text-center text-sm text-slate-500 py-3">
          🔒 Comentariile sunt blocate pentru această postare
        </div>
      )}

      {/* Comments */}
      {tree.length > 0 ? (
        <div className="divide-y divide-white/5">
          {tree.map((comment) => (
            <CommentItem
              key={comment.comment.id}
              data={comment}
              postAuthorId={postAuthorId}
              currentUserId={currentUserId}
              onRefresh={handleRefresh}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 space-y-2">
          <MessageSquare className="h-8 w-8 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-500">
            Niciun comentariu încă. Fii primul!
          </p>
        </div>
      )}
    </div>
  );
}
