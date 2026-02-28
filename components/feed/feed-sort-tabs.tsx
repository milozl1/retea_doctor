"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { Flame, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "hot", label: "Fierbinte", icon: Flame },
  { value: "new", label: "Nou", icon: Clock },
  { value: "top", label: "Top", icon: TrendingUp },
] as const;

interface FeedSortTabsProps {
  currentSort?: string;
}

export function FeedSortTabs({ currentSort = "hot" }: FeedSortTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
      {SORT_OPTIONS.map(({ value, label, icon: Icon }) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);
        const isActive = currentSort === value;

        return (
          <Link
            key={value}
            href={`${pathname}?${params}`}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/10"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
