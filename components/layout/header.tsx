"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Plus,
  Menu,
  User,
  LogOut,
  Settings,
  Bookmark,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useState } from "react";

interface HeaderProps {
  user: {
    id: string;
    firstName: string;
    imageUrl: string;
    email: string | null;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#060a14]/80 backdrop-blur-2xl border-b border-white/[0.04]" />
      
      {/* Ambient glow line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="relative flex h-full items-center px-4 lg:px-6 gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mr-2 group">
          <div className="relative w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow duration-300">
            <Sparkles className="w-4.5 h-4.5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-bold text-white tracking-tight leading-none">
              Rețea Medicală
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
              by MedLearn
            </span>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-auto">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-primary/70" />
            <Input
              placeholder="Caută postări, comunități, medici..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="pl-10 pr-4 h-10 bg-white/[0.04] border-white/[0.06] text-white placeholder:text-slate-600 rounded-xl transition-all duration-300 focus:bg-white/[0.08] focus:border-primary/30 focus:ring-1 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary/5"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/[0.06] bg-white/[0.03] px-1.5 font-mono text-[10px] text-slate-600">
              ⌘K
            </kbd>
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {user ? (
            <>
              <Link href="/post/new">
                <Button
                  size="sm"
                  className="gap-2 h-9 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 rounded-xl text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 border-0"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm font-medium">Postare</span>
                </Button>
              </Link>

              <NotificationBell userId={user.id} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full ring-2 ring-white/[0.06] hover:ring-primary/30 transition-all duration-300"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.imageUrl}
                        alt={user.firstName}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/30 to-indigo-500/30 text-primary text-xs font-semibold">
                        {user.firstName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-60 bg-[#0c1222]/95 backdrop-blur-2xl border-white/[0.08] shadow-2xl shadow-black/50 rounded-xl p-1"
                  align="end"
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-white/[0.06]">
                        <AvatarImage src={user.imageUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/30 to-indigo-500/30 text-primary text-sm font-semibold">
                          {user.firstName[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-white">{user.firstName}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[160px]">{user.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/[0.06] mx-2" />
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/u/${user.id}`}
                      className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white rounded-lg cursor-pointer"
                    >
                      <User className="h-4 w-4 text-slate-500" />
                      Profilul Meu
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/saved"
                      className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white rounded-lg cursor-pointer"
                    >
                      <Bookmark className="h-4 w-4 text-slate-500" />
                      Salvate
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/[0.06] mx-2" />
                  <DropdownMenuItem
                    className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white rounded-lg cursor-pointer"
                    onClick={() => {
                      fetch("/api/auth/signout", { method: "POST" }).then(
                        () => {
                          router.push("/");
                          router.refresh();
                        }
                      );
                    }}
                  >
                    <LogOut className="h-4 w-4 text-slate-500" />
                    Deconectare
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/auth/login">
              <Button
                size="sm"
                className="h-9 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] hover:border-primary/30 text-white rounded-xl transition-all duration-300"
              >
                Conectare
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
