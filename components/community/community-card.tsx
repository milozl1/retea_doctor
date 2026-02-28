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
}

export function CommunityCard({
  slug,
  name,
  description,
  color,
  iconEmoji,
  memberCount,
  postCount,
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
          <div>
            <h3 className="font-semibold text-white">c/{name}</h3>
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
