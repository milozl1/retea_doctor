"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { useVote } from "@/hooks/use-vote";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";

interface VoteButtonsProps {
  postId?: number;
  commentId?: number;
  upvotes: number;
  downvotes: number;
  score: number;
  userVote?: "upvote" | "downvote" | null;
  orientation?: "vertical" | "horizontal";
}

export function VoteButtons({
  postId,
  commentId,
  upvotes,
  downvotes,
  score,
  userVote: initialUserVote = null,
  orientation = "vertical",
}: VoteButtonsProps) {
  const { score: currentScore, userVote, vote, isLoading } = useVote({
    postId,
    commentId,
    initialUpvotes: upvotes,
    initialDownvotes: downvotes,
    initialScore: score,
    initialUserVote,
  });

  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        isVertical ? "flex-col" : "flex-row"
      )}
    >
      <button
        onClick={() => vote("upvote")}
        disabled={isLoading}
        className={cn(
          "p-1 rounded transition-colors",
          userVote === "upvote"
            ? "text-orange-500"
            : "text-slate-400 hover:text-orange-500"
        )}
        aria-label="Upvote"
      >
        <ChevronUp size={20} />
      </button>

      <span
        className={cn(
          "text-sm font-semibold min-w-[2ch] text-center",
          userVote === "upvote"
            ? "text-orange-500"
            : userVote === "downvote"
            ? "text-blue-500"
            : "text-slate-300"
        )}
      >
        {formatNumber(currentScore)}
      </span>

      <button
        onClick={() => vote("downvote")}
        disabled={isLoading}
        className={cn(
          "p-1 rounded transition-colors",
          userVote === "downvote"
            ? "text-blue-500"
            : "text-slate-400 hover:text-blue-500"
        )}
        aria-label="Downvote"
      >
        <ChevronDown size={20} />
      </button>
    </div>
  );
}
