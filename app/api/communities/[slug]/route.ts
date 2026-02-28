import { NextRequest, NextResponse } from "next/server";
import { getCommunityBySlug } from "@/db/queries";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { communityMemberships, posts, networkUsers, communities } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const community = await getCommunityBySlug(params.slug);
  if (!community) {
    return NextResponse.json(
      { error: "Comunitatea nu a fost găsită" },
      { status: 404 }
    );
  }

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

  // Get recent posts count
  const recentPosts = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.communityId, community.id))
    .limit(1);

  return NextResponse.json({
    community,
    isMember,
    hasRecentPosts: recentPosts.length > 0,
  });
}
