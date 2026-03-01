"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  userId?: string | null;
}

export function MobileNav({ userId }: MobileNavProps) {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Feed", icon: Home },
    { href: "/search", label: "Caută", icon: Search },
    { href: "/post/new", label: "", icon: Plus, highlight: true },
    { href: "/messages", label: "Mesaje", icon: MessageSquare },
    {
      href: userId ? `/u/${userId}` : "/auth/login",
      label: "Profil",
      icon: User,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Gradient fade */}
      <div className="absolute -top-6 inset-x-0 h-6 bg-gradient-to-t from-[#040711] to-transparent pointer-events-none" />
      <div className="bg-[#0a0e1a]/95 backdrop-blur-2xl border-t border-white/[0.04]">
        <div className="flex items-center justify-around h-16 px-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.highlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-center -mt-5 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-500 text-white shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all relative",
                  isActive
                    ? "text-primary"
                    : "text-slate-600 hover:text-slate-400"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute -top-1 w-5 h-[2px] rounded-full bg-primary shadow-lg shadow-primary/50" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
