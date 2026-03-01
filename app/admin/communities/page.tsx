import { db } from "@/db/drizzle";
import { communities } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Users, Plus, Pencil, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminCommunitiesPage() {
  const allCommunities = await db
    .select()
    .from(communities)
    .orderBy(desc(communities.memberCount));

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Comunități</h1>
          <Link href="/admin/communities/new">
            <Button size="sm" className="bg-gradient-to-r from-primary to-blue-500 gap-2">
              <Plus className="h-4 w-4" />
              Comunitate nouă
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {allCommunities.map((community) => (
            <div key={community.id} className="glass-card p-4 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: community.color + "20" }}
                >
                  {community.iconSrc || "🏥"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white">
                    {community.name}
                  </h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {community.memberCount} membri · {community.postCount} postări
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                /{community.slug}
              </p>
              <div className="flex items-center gap-2">
                <Link href={`/admin/communities/${community.id}/edit`}>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-white/10 text-slate-300 hover:text-white">
                    <Pencil className="h-3 w-3" />
                    Editează
                  </Button>
                </Link>
                <Link href={`/c/${community.slug}`}>
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-slate-500 hover:text-white">
                    <ExternalLink className="h-3 w-3" />
                    Vezi
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
