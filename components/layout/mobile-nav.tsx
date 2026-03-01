"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bell, Bookmark, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Acasă" },
  { href: "/search", icon: Search, label: "Căutare" },
  { href: "/post/new", icon: PlusCircle, label: "Postează" },
  { href: "/notifications", icon: Bell, label: "Notificări" },
  { href: "/saved", icon: Bookmark, label: "Salvate" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 lg:hidden">
      <div className="flex items-center justify-around h-14 px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          const isNotifications = href === "/notifications";

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors relative",
                isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {isNotifications && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
