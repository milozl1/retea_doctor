"use client";

import Link from "next/link";
import { useState } from "react";
import { Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { toast } from "sonner";

interface CommunityCardProps {
  community: {
    id: number;
    slug: string;
    name: string;
    description: string;
    color: string;
    memberCount: number;
    postCount: number;
  };
  isMember?: boolean;
  icon?: string;
}

export function CommunityCard({ community, isMember: initialIsMember = false, icon = "🏥" }: CommunityCardProps) {
  const [isMember, setIsMember] = useState(initialIsMember);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/communities/${community.slug}/join`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Eroare la operațiune");
      const data = await response.json();
      setIsMember(data.joined);
      toast.success(data.joined ? "Te-ai alăturat comunității!" : "Ai părăsit comunitatea");
    } catch {
      toast.error("Eroare. Încearcă din nou.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link href={`/c/${community.slug}`}>
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: community.color + "20" }}
            >
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">c/{community.name}</h3>
              <p className="text-slate-400 text-xs line-clamp-2 mt-0.5">
                {community.description}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant={isMember ? "outline" : "default"}
            className={
              isMember
                ? "border-white/20 text-slate-300 hover:text-red-400 hover:border-red-400/50 text-xs"
                : "bg-blue-600 hover:bg-blue-700 text-white text-xs"
            }
            onClick={handleJoin}
            disabled={isLoading}
          >
            {isMember ? "Urmărești" : "Urmărește"}
          </Button>
        </div>
        <div className="flex gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {formatNumber(community.memberCount)} membri
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {formatNumber(community.postCount)} postări
          </span>
        </div>
      </div>
    </Link>
  );
}
