import Link from "next/link";
import { PlusCircle, User, ExternalLink } from "lucide-react";
import { SearchBar } from "@/components/search/search-bar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton } from "@/components/auth/sign-out-button";

const MEDLEARN_URL = process.env.NEXT_PUBLIC_MEDLEARN_URL ?? "";

export async function Header() {
  const user = await currentUser();

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl">🏥</span>
          <span className="font-bold text-white hidden sm:block">MedRețea</span>
        </Link>

        {/* Search */}
        <div className="flex-1">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Cross-app MedLearn link */}
              {MEDLEARN_URL && (
                <a
                  href={MEDLEARN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Deschide MedLearn"
                  className="hidden md:flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  MedLearn
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}

              <Link href="/post/new">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 hidden sm:flex">
                  <PlusCircle className="h-4 w-4" />
                  Postează
                </Button>
              </Link>

              <NotificationBell />

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none rounded-full">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={user.imageUrl} alt={user.firstName} />
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {user.firstName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-slate-800 border-white/10 text-white w-52"
                >
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user.firstName}</p>
                    {user.email && (
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    )}
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild>
                    <Link href={`/u/${user.id}`} className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Profilul meu
                    </Link>
                  </DropdownMenuItem>
                  {MEDLEARN_URL && (
                    <DropdownMenuItem asChild>
                      <a
                        href={MEDLEARN_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Deschide MedLearn
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <SignOutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white hidden sm:flex">
                  Autentifică-te
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <span className="hidden sm:inline">Înregistrare</span>
                  <User className="h-4 w-4 sm:hidden" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

