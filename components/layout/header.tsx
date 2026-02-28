import Link from "next/link";
import { PlusCircle, User } from "lucide-react";
import { SearchBar } from "@/components/search/search-bar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
              <Link href="/post/new">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 hidden sm:flex">
                  <PlusCircle className="h-4 w-4" />
                  Postează
                </Button>
              </Link>
              <NotificationBell />
              <Link href={`/u/${user.id}`}>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={user.imageUrl} />
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {user.firstName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <User className="h-4 w-4 mr-1" />
                Autentifică-te
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
