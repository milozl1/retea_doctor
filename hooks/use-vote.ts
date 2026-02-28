"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface VoteState {
  upvotes: number;
  downvotes: number;
  score: number;
  userVote: "upvote" | "downvote" | null;
}

interface UseVoteOptions {
  postId?: number;
  commentId?: number;
  initialUpvotes: number;
  initialDownvotes: number;
  initialScore: number;
  initialUserVote?: "upvote" | "downvote" | null;
}

export function useVote({
  postId,
  commentId,
  initialUpvotes,
  initialDownvotes,
  initialScore,
  initialUserVote = null,
}: UseVoteOptions) {
  const [state, setState] = useState<VoteState>({
    upvotes: initialUpvotes,
    downvotes: initialDownvotes,
    score: initialScore,
    userVote: initialUserVote,
  });
  const [isLoading, setIsLoading] = useState(false);

  const vote = useCallback(
    async (type: "upvote" | "downvote") => {
      if (isLoading) return;

      // Optimistic update
      const previousState = { ...state };
      setState((prev) => {
        let newUpvotes = prev.upvotes;
        let newDownvotes = prev.downvotes;

        if (prev.userVote === type) {
          // Toggle off
          if (type === "upvote") newUpvotes--;
          else newDownvotes--;
          return {
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            score: newUpvotes - newDownvotes,
            userVote: null,
          };
        } else {
          if (prev.userVote) {
            // Change vote
            if (prev.userVote === "upvote") newUpvotes--;
            else newDownvotes--;
          }
          if (type === "upvote") newUpvotes++;
          else newDownvotes++;
          return {
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            score: newUpvotes - newDownvotes,
            userVote: type,
          };
        }
      });

      setIsLoading(true);
      try {
        const url = postId
          ? `/api/posts/${postId}/vote`
          : `/api/comments/${commentId}/vote`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error ?? "Eroare la vot");
        }

        const data = await response.json();
        setState({
          upvotes: data.upvotes,
          downvotes: data.downvotes,
          score: data.score,
          userVote: data.userVote,
        });
      } catch (error) {
        // Revert on error
        setState(previousState);
        toast.error(
          error instanceof Error ? error.message : "Eroare la vot"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [state, isLoading, postId, commentId]
  );

  return { ...state, vote, isLoading };
}
