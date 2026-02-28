"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { toast } from "sonner";

interface VoteButtonsProps {
  id: number;
  type: "post" | "comment";
  score: number;
  userVote: "upvote" | "downvote" | null;
  vertical?: boolean;
}

export function VoteButtons({
  id,
  type,
  score: initialScore,
  userVote: initialVote,
  vertical = true,
}: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialVote);
  const [isVoting, setIsVoting] = useState(false);
  const [animateUp, setAnimateUp] = useState(false);
  const [animateDown, setAnimateDown] = useState(false);

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (isVoting) return;
    setIsVoting(true);

    const prevScore = score;
    const prevVote = userVote;

    let newScore = score;
    let newVote: "upvote" | "downvote" | null = voteType;

    if (userVote === voteType) {
      newVote = null;
      newScore = voteType === "upvote" ? score - 1 : score + 1;
    } else if (userVote) {
      newScore = voteType === "upvote" ? score + 2 : score - 2;
    } else {
      newScore = voteType === "upvote" ? score + 1 : score - 1;
    }

    setScore(newScore);
    setUserVote(newVote);

    if (voteType === "upvote") {
      setAnimateUp(true);
      setTimeout(() => setAnimateUp(false), 300);
    } else {
      setAnimateDown(true);
      setTimeout(() => setAnimateDown(false), 300);
    }

    try {
      const endpoint =
        type === "post"
          ? `/api/posts/${id}/vote`
          : `/api/comments/${id}/vote`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: voteType }),
      });

      if (!res.ok) {
        throw new Error("Vote failed");
      }
    } catch {
      setScore(prevScore);
      setUserVote(prevVote);
      toast.error("Nu s-a putut înregistra votul");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center",
        vertical ? "flex-col gap-0.5" : "flex-row gap-1"
      )}
    >
      <button
        onClick={() => handleVote("upvote")}
        disabled={isVoting}
        className={cn(
          "p-1.5 rounded-lg transition-all duration-200",
          userVote === "upvote"
            ? "text-primary bg-primary/[0.12]"
            : "text-slate-600 hover:text-primary hover:bg-primary/[0.06]",
          animateUp && "animate-vote-up scale-110"
        )}
        aria-label="Vot pozitiv"
      >
        <ChevronUp className="h-4 w-4" strokeWidth={2.5} />
      </button>

      <span
        className={cn(
          "text-xs font-bold min-w-[2ch] text-center tabular-nums transition-colors",
          userVote === "upvote" && "text-primary",
          userVote === "downvote" && "text-red-400",
          !userVote && "text-slate-500"
        )}
      >
        {formatNumber(score)}
      </span>

      <button
        onClick={() => handleVote("downvote")}
        disabled={isVoting}
        className={cn(
          "p-1.5 rounded-lg transition-all duration-200",
          userVote === "downvote"
            ? "text-red-400 bg-red-400/[0.12]"
            : "text-slate-600 hover:text-red-400 hover:bg-red-400/[0.06]",
          animateDown && "animate-vote-down scale-110"
        )}
        aria-label="Vot negativ"
      >
        <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
