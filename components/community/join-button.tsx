"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface JoinCommunityButtonProps {
  communityId: number;
  isMember: boolean;
}

export function JoinCommunityButton({ communityId, isMember: initialMember }: JoinCommunityButtonProps) {
  const [isMember, setIsMember] = useState(initialMember);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const { joinCommunity } = await import("@/actions/vote-actions");
      const result = await joinCommunity(communityId);
      setIsMember(result.joined);
      toast.success(result.joined ? "Te-ai alăturat comunității!" : "Ai părăsit comunitatea");
    } catch {
      toast.error("Eroare la actualizarea apartenenței");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={isMember ? "outline" : "default"}
      onClick={handleToggle}
      disabled={isLoading}
      className={isMember
        ? "border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30"
        : "bg-primary hover:bg-primary/90"
      }
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isMember ? (
        <>
          <UserMinus className="h-4 w-4 mr-1" />
          Părăsește
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1" />
          Alătură-te
        </>
      )}
    </Button>
  );
}
