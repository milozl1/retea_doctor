import { db } from "@/db/drizzle";
import { communities } from "@/db/schema";
import { desc } from "drizzle-orm";
import { CommunityCard } from "@/components/community/community-card";
import { defaultCommunities } from "@/config/communities";

export const metadata = {
  title: "Comunități — MedRețea",
};

async function getAllCommunities() {
  try {
    return await db
      .select()
      .from(communities)
      .orderBy(desc(communities.memberCount));
  } catch {
    return [];
  }
}

export default async function CommunitiesPage() {
  const allCommunities = await getAllCommunities();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Comunități</h1>
        <p className="text-slate-400 text-sm mt-1">
          Descoperă și alătură-te comunităților medicale
        </p>
      </div>

      {allCommunities.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-4">🏥</div>
          <p>Nicio comunitate încă</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {allCommunities.map((community) => {
            const config = defaultCommunities.find(
              (c) => c.slug === community.slug
            );
            return (
              <CommunityCard
                key={community.id}
                community={community}
                icon={config?.icon}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
