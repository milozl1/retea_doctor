"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  initialFollowersCount: number;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  initialFollowersCount,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    const prev = isFollowing;
    const prevCount = followersCount;

    setIsFollowing(!prev);
    setFollowersCount(prev ? prevCount - 1 : prevCount + 1);

    try {
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIsFollowing(data.following);
      toast.success(data.following ? "Urmărești acest utilizator" : "Nu mai urmărești acest utilizator");
    } catch {
      setIsFollowing(prev);
      setFollowersCount(prevCount);
      toast.error("Eroare la actualizare");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      size="sm"
      variant={isFollowing ? "outline" : "default"}
      className={
        isFollowing
          ? "border-white/10 text-slate-300 hover:text-white hover:border-red-500/30 hover:bg-red-500/10 gap-2"
          : "bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white gap-2 shadow-lg shadow-primary/20"
      }
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserCheck className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {isFollowing ? "Urmărești" : "Urmărește"}
    </Button>
  );
}
