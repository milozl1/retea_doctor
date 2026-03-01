"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Flame, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SORT_TABS = [
  { value: "hot", label: "Populare", icon: Flame, color: "text-orange-400" },
  { value: "new", label: "Recente", icon: Clock, color: "text-emerald-400" },
  { value: "top", label: "Top", icon: TrendingUp, color: "text-violet-400" },
];

export function FeedSortTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentSort = searchParams.get("sort") ?? "hot";

  const handleSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="glass-card p-1 flex gap-0.5">
      {SORT_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentSort === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => handleSort(tab.value)}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-300",
              isActive
                ? "bg-white/[0.07] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
            )}
          >
            <Icon className={cn("h-4 w-4", isActive ? tab.color : "")} />
            {tab.label}
            {isActive && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-primary/60" />
            )}
          </button>
        );
      })}
    </div>
  );
}
