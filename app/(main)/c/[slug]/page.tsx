import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCommunityBySlug } from "@/db/queries";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { communityMemberships } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { PostListServer } from "@/components/feed/post-list-server";
import { FeedSortTabs } from "@/components/feed/feed-sort-tabs";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import Link from "next/link";

export default async function CommunityPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { sort?: string };
}) {
  const community = await getCommunityBySlug(params.slug);
  if (!community) {
    notFound();
  }

  const sort = (searchParams.sort as "hot" | "new" | "top") || "hot";

  const { userId } = await auth();
  let isMember = false;

  if (userId) {
    const [membership] = await db
      .select()
      .from(communityMemberships)
      .where(
        and(
          eq(communityMemberships.userId, userId),
          eq(communityMemberships.communityId, community.id)
        )
      )
      .limit(1);
    isMember = !!membership;
  }

  return (
    <div className="space-y-4">
      {/* Community Header */}
      <div className="glass p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: community.color + "20" }}
            >
              {community.iconSrc || "🏥"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {community.name}
              </h1>
              <p className="text-gray-400 text-sm flex items-center gap-1">
                <Users className="h-3 w-3" />
                {community.memberCount} membri
              </p>
            </div>
          </div>

          {userId && (
            <div className="flex gap-2">
              <Link href={`/post/new?community=${community.slug}`}>
                <Button size="sm" variant="outline" className="glass-sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Postare nouă
                </Button>
              </Link>
            </div>
          )}
        </div>

        {community.description && (
          <p className="text-gray-300 text-sm mt-3">
            {community.description}
          </p>
        )}
      </div>

      {/* Sort Tabs */}
      <FeedSortTabs />

      {/* Post List */}
      <Suspense
        fallback={
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        }
      >
        <PostListServer sort={sort} communityId={community.id} communitySlug={community.slug} />
      </Suspense>
    </div>
  );
}
