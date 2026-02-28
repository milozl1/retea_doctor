"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Flame,
  Users,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Plus,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Feed", icon: Home, description: "Toate postările" },
  { href: "/?sort=hot", label: "Populare", icon: Flame, description: "Trending acum" },
  { href: "/c", label: "Comunități", icon: Compass, description: "Explorează" },
];

interface CommunityItem {
  slug: string;
  name: string;
  color: string;
  iconEmoji: string;
}

interface SidebarProps {
  communities: CommunityItem[];
}

export function Sidebar({ communities }: SidebarProps) {
  const pathname = usePathname();
  const [showAll, setShowAll] = useState(false);

  const displayedCommunities = showAll
    ? communities
    : communities.slice(0, 8);

  return (
    <nav className="flex flex-col h-full py-3">
      {/* Primary Navigation */}
      <div className="px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative",
                isActive
                  ? "bg-primary/[0.12] text-primary"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary shadow-lg shadow-primary/50" />
              )}
              <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-300")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mx-5 my-3 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Communities */}
      <div className="px-3 flex-1 overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between mb-2 px-3">
          <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.12em]">
            Comunități
          </h3>
          <Link href="/c">
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-600 hover:text-primary transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="space-y-0.5">
          {displayedCommunities.map((community) => {
            const isActive = pathname === `/c/${community.slug}`;
            return (
              <Link
                key={community.slug}
                href={`/c/${community.slug}`}
                className={cn(
                  "group flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-200",
                  isActive
                    ? "bg-white/[0.06] text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                )}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 shadow-sm"
                  style={{
                    backgroundColor: community.color + "18",
                    border: `1px solid ${community.color}20`,
                  }}
                >
                  {community.iconEmoji}
                </span>
                <span className="truncate text-[13px]">{community.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-lg shadow-primary/50" />
                )}
              </Link>
            );
          })}
        </div>

        {communities.length > 8 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-3 py-2 mt-1 text-[11px] text-slate-600 hover:text-slate-400 transition-colors font-medium uppercase tracking-wide"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Mai puțin
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Toate ({communities.length})
              </>
            )}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 mt-auto pt-3">
        <div className="mx-2 mb-3 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <Link
          href={process.env.NEXT_PUBLIC_MEDLEARN_URL || "http://localhost:3000"}
          className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-slate-500 hover:text-primary/80 transition-all duration-200 hover:bg-primary/[0.04]"
          target="_blank"
        >
          <BookOpen className="h-4 w-4 text-slate-600 group-hover:text-primary/60" />
          <span>Înapoi la MedLearn</span>
        </Link>
      </div>
    </nav>
  );
}
