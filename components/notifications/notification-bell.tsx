"use client";

import useSWR from "swr";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const { data } = useSWR<{ unreadCount: number }>(
    userId ? `/api/notifications?count=true` : null,
    (url: string) => fetch(url).then(r => r.json()),
    { refreshInterval: 60000 }
  );

  const count = data?.unreadCount ?? 0;

  return (
    <Link href="/notifications" className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 text-slate-400 hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[1rem] flex items-center justify-center rounded-full bg-emergency text-white text-[10px] font-bold px-1">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>
    </Link>
  );
}
