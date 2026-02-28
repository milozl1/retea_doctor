"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";

export function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <Link href="/notifications" className="relative p-2 text-slate-400 hover:text-white transition-colors">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
