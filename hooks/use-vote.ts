import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useVote(
  initialScore: number,
  initialVote: "upvote" | "downvote" | null,
  id: number,
  type: "post" | "comment"
) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialVote);
  const [isVoting, setIsVoting] = useState(false);

  const vote = useCallback(
    async (voteType: "upvote" | "downvote") => {
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

        if (!res.ok) throw new Error("Vote failed");
      } catch {
        setScore(prevScore);
        setUserVote(prevVote);
        toast.error("Nu s-a putut înregistra votul");
      } finally {
        setIsVoting(false);
      }
    },
    [id, type, score, userVote, isVoting]
  );

  return { score, userVote, vote, isVoting };
}
