import Link from "next/link";
import { Home, Flame, BookmarkIcon, Bell, ExternalLink } from "lucide-react";
import { db } from "@/db/drizzle";
import { communities } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { defaultCommunities } from "@/config/communities";

const MEDLEARN_URL = process.env.NEXT_PUBLIC_MEDLEARN_URL ?? "";

async function getCommunities() {
  try {
    return await db
      .select()
      .from(communities)
      .where(eq(communities.isDefault, true))
      .orderBy(desc(communities.memberCount))
      .limit(10);
  } catch {
    return [];
  }
}

export async function Sidebar() {
  const sidebarCommunities = await getCommunities();

  const navItems = [
    { href: "/", icon: Home, label: "Acasă" },
    { href: "/?sort=hot", icon: Flame, label: "Popular" },
    { href: "/saved", icon: BookmarkIcon, label: "Salvate" },
    { href: "/notifications", icon: Bell, label: "Notificări" },
  ];

  return (
    <aside className="w-56 flex-shrink-0">
      <nav className="sticky top-20 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}

        {sidebarCommunities.length > 0 && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Comunități
              </p>
            </div>
            {sidebarCommunities.map((community) => {
              const config = defaultCommunities.find(
                (c) => c.slug === community.slug
              );
              return (
                <Link
                  key={community.id}
                  href={`/c/${community.slug}`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
                >
                  <span>{config?.icon ?? "🏥"}</span>
                  <span className="truncate">c/{community.name}</span>
                </Link>
              );
            })}
            <Link
              href="/c"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-white/10 transition-colors text-sm"
            >
              <span>+</span>
              <span>Toate comunitățile</span>
            </Link>
          </>
        )}

        {/* MedLearn cross-app link */}
        {MEDLEARN_URL && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Platformă
              </p>
            </div>
            <a
              href={MEDLEARN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
            >
              <span>📚</span>
              <span className="flex-1 truncate">MedLearn</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </>
        )}
      </nav>
    </aside>
  );
}

