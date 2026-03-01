import Link from "next/link";
import { Users } from "lucide-react";

interface CommunityCardProps {
  slug: string;
  name: string;
  description: string;
  color: string;
  iconEmoji?: string;
  memberCount: number;
  postCount: number;
  isMember?: boolean;
}

export function CommunityCard({
  slug,
  name,
  description,
  color,
  iconEmoji,
  memberCount,
  postCount,
  isMember,
}: CommunityCardProps) {
  return (
    <Link href={`/c/${slug}`} className="block">
      <div className="glass-card-hover p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ backgroundColor: color + "20" }}
          >
            {iconEmoji || "📁"}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">c/{name}</h3>
              {isMember && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/20">
                  Membru
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Users className="h-3 w-3" />
              {memberCount} membri • {postCount} postări
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-400 line-clamp-2">{description}</p>
      </div>
    </Link>
  );
}
