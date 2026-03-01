import { db } from "@/db/drizzle";
import { communities } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber } from "@/lib/utils";
import { defaultCommunities } from "@/config/communities";
import { Users, FileText, LayoutGrid } from "lucide-react";

export const metadata = {
  title: "Comunități — Admin MedRețea",
};

async function getCommunities() {
  try {
    return await db
      .select()
      .from(communities)
      .orderBy(desc(communities.memberCount));
  } catch {
    return [];
  }
}

export default async function AdminCommunitiesPage() {
  const allCommunities = await getCommunities();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <LayoutGrid className="h-6 w-6 text-purple-400" />
          Comunități
        </h1>
        <span className="text-sm text-slate-400">
          {allCommunities.length} comunități
        </span>
      </div>

      <div className="space-y-2">
        {allCommunities.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white/5 border border-white/10 rounded-xl">
            <LayoutGrid className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nicio comunitate. Rulează scriptul de seed.</p>
          </div>
        ) : (
          allCommunities.map((community) => {
            const config = defaultCommunities.find(
              (c) => c.slug === community.slug
            );
            return (
              <div
                key={community.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: community.color + "20" }}
                  >
                    {config?.icon ?? "🏥"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/c/${community.slug}`}
                        className="font-medium text-white hover:text-blue-400 transition-colors"
                      >
                        c/{community.name}
                      </Link>
                      {community.isDefault && (
                        <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 truncate">
                      {community.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 text-xs text-slate-500 flex-shrink-0">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {formatNumber(community.memberCount)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {formatNumber(community.postCount)}
                    </span>
                    <span>{formatDate(community.createdAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/c/${community.slug}/about`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Info
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
