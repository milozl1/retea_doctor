import Link from "next/link";
import { Users, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { DEFAULT_COMMUNITIES } from "@/config/communities";

interface CommunitySidebarProps {
  community: {
    id: number;
    slug: string;
    name: string;
    description: string;
    rules: string;
    color: string;
    memberCount: number;
    postCount: number;
    createdAt: Date | string;
  };
  isMember?: boolean;
}

export function CommunitySidebar({ community, isMember = false }: CommunitySidebarProps) {
  const config = DEFAULT_COMMUNITIES.find((c: { slug: string }) => c.slug === community.slug);

  return (
    <div className="space-y-3">
      {/* About card */}
      <div
        className="rounded-xl p-4 border border-white/10 space-y-3"
        style={{
          background: `linear-gradient(135deg, ${community.color}15 0%, rgba(255,255,255,0.03) 100%)`,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config?.iconEmoji ?? "🏥"}</span>
          <div>
            <h3 className="font-semibold text-white text-sm">c/{community.name}</h3>
            <p className="text-xs text-slate-400">Comunitate medicală</p>
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">
          {community.description}
        </p>

        <div className="flex gap-4 text-xs text-slate-500 border-t border-white/10 pt-3">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span className="font-medium text-slate-300">
              {formatNumber(community.memberCount)}
            </span>
            <span>membri</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span className="font-medium text-slate-300">
              {formatNumber(community.postCount)}
            </span>
            <span>postări</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Link href={`/post/new?communityId=${community.id}`} className="block">
            <Button
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              + Creează postare
            </Button>
          </Link>
          <Link href={`/c/${community.slug}/about`} className="block">
            <Button
              size="sm"
              variant="ghost"
              className="w-full text-slate-400 hover:text-white border border-white/10 flex items-center gap-1.5"
            >
              <Info className="h-3.5 w-3.5" />
              Despre comunitate
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
