import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db/drizzle";
import { communities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FeedSortTabs } from "@/components/feed/feed-sort-tabs";
import { PostList } from "@/components/feed/post-list";
import { Users, FileText } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { defaultCommunities } from "@/config/communities";
import { currentUser } from "@/lib/auth";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}

async function getCommunity(slug: string) {
  try {
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.slug, slug))
      .limit(1);
    return community;
  } catch {
    return null;
  }
}

export default async function CommunityPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const community = await getCommunity(slug);
  if (!community) notFound();

  const user = await currentUser();
  const { sort: sortParam } = await searchParams;
  const sort = (sortParam as "hot" | "new" | "top") ?? "hot";
  const config = defaultCommunities.find((c) => c.slug === community.slug);

  return (
    <div className="space-y-4">
      {/* Community header */}
      <div
        className="rounded-xl p-5 border border-white/10"
        style={{
          background: `linear-gradient(135deg, ${community.color}20 0%, rgba(255,255,255,0.03) 100%)`,
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{config?.icon ?? "🏥"}</span>
          <div>
            <h1 className="text-xl font-bold text-white">c/{community.name}</h1>
            <p className="text-slate-400 text-sm">{community.description}</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {formatNumber(community.memberCount)} membri
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {formatNumber(community.postCount)} postări
          </span>
        </div>
      </div>

      {/* Post CTA */}
      {user && (
        <Link href={`/post/new?communityId=${community.id}`}>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/[0.07] transition-colors cursor-pointer flex items-center gap-3">
            <span className="text-slate-400 text-sm">Postează în c/{community.name}...</span>
          </div>
        </Link>
      )}

      {/* Sort */}
      <FeedSortTabs currentSort={sort} />

      {/* Posts */}
      <PostList sort={sort} communityId={community.id} />
    </div>
  );
}
