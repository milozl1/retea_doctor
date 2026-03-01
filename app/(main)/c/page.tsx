import { getCommunities } from "@/db/queries";
import { CommunityCard } from "@/components/community/community-card";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { communityMemberships } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function CommunitiesPage() {
  const [allCommunities, { userId }] = await Promise.all([
    getCommunities(),
    auth(),
  ]);

  let userMemberIds: number[] = [];
  if (userId) {
    const memberships = await db
      .select({ communityId: communityMemberships.communityId })
      .from(communityMemberships)
      .where(eq(communityMemberships.userId, userId));
    userMemberIds = memberships.map((m) => m.communityId);
  }

  return (
    <div className="space-y-4">
      <div className="glass p-6">
        <h1 className="text-xl font-bold text-white mb-1">
          🏛️ Comunități
        </h1>
        <p className="text-gray-400 text-sm">
          Explorează comunitățile medicale și alătură-te discuțiilor.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {allCommunities.map((community) => (
          <CommunityCard
            key={community.id}
            slug={community.slug}
            name={community.name}
            description={community.description}
            color={community.color}
            iconEmoji={community.iconSrc || undefined}
            memberCount={community.memberCount}
            postCount={community.postCount}
            isMember={userMemberIds.includes(community.id)}
          />
        ))}
      </div>
    </div>
  );
}
