import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { communities, communityMemberships } from "@/db/schema";
import { auth } from "@/lib/auth";
import { desc } from "drizzle-orm";
import { eq } from "drizzle-orm";

export async function GET(_request: NextRequest) {
  const start = Date.now();
  try {
    const { userId } = await auth();

    const allCommunities = await db
      .select()
      .from(communities)
      .orderBy(desc(communities.memberCount));

    // If logged in, fetch memberships
    let membershipSet = new Set<number>();
    if (userId) {
      const memberships = await db
        .select({ communityId: communityMemberships.communityId })
        .from(communityMemberships)
        .where(eq(communityMemberships.userId, userId));
      membershipSet = new Set(memberships.map((m) => m.communityId));
    }

    const result = allCommunities.map((c) => ({
      ...c,
      isMember: membershipSet.has(c.id),
    }));

    const response = NextResponse.json({ communities: result });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    console.error("GET /api/communities error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
