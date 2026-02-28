"use client";

import { useMemo } from "react";
import { CommentItem } from "./comment-item";
import { useComments } from "@/hooks/use-comments";
import { CommentForm } from "./comment-form";
import { Loader2 } from "lucide-react";

interface CommentTreeProps {
  postId: number;
  postAuthorId: string;
  currentUserId?: string;
  sort?: string;
}

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

function buildTree(comments: CommentData[]): CommentData[] {
  const map = new Map<number, CommentData>();
  const roots: CommentData[] = [];

  comments.forEach((item) => {
    map.set(item.comment.id, { ...item, children: [] });
  });

  map.forEach((item) => {
    if (item.comment.parentId) {
      const parent = map.get(item.comment.parentId);
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push(item);
      } else {
        roots.push(item);
      }
    } else {
      roots.push(item);
    }
  });

  return roots;
}

export function CommentTree({
  postId,
  postAuthorId,
  currentUserId,
  sort = "best",
}: CommentTreeProps) {
  const { comments, isLoading, mutate } = useComments(postId, sort);
  const tree = useMemo(() => buildTree(comments), [comments]);

  return (
    <div id="comentarii" className="space-y-4">
      {currentUserId && (
        <div className="mb-6">
          <CommentForm
            postId={postId}
            onSuccess={() => mutate()}
            placeholder="Adaugă un comentariu..."
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : tree.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p>Niciun comentariu încă. Fii primul!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tree.map((item) => (
            <CommentItem
              key={item.comment.id}
              data={item}
              postAuthorId={postAuthorId}
              currentUserId={currentUserId}
              onRefresh={() => mutate()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
