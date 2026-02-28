import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { communities, communityMemberships } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function POST(_request: NextRequest, { params }: Params) {
  const start = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { slug } = await params;
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.slug, slug))
      .limit(1);

    if (!community) {
      return NextResponse.json(
        { error: "Comunitatea nu a fost găsită" },
        { status: 404 }
      );
    }

    const [existing] = await db
      .select()
      .from(communityMemberships)
      .where(
        and(
          eq(communityMemberships.userId, userId),
          eq(communityMemberships.communityId, community.id)
        )
      )
      .limit(1);

    if (existing) {
      // Leave community
      await db
        .delete(communityMemberships)
        .where(eq(communityMemberships.id, existing.id));

      await db
        .update(communities)
        .set({ memberCount: sql`${communities.memberCount} - 1` })
        .where(eq(communities.id, community.id));

      const response = NextResponse.json({ joined: false });
      response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
      return response;
    }

    // Join community
    await db.insert(communityMemberships).values({
      userId,
      communityId: community.id,
    });

    await db
      .update(communities)
      .set({ memberCount: sql`${communities.memberCount} + 1` })
      .where(eq(communities.id, community.id));

    const response = NextResponse.json({ joined: true });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    console.error("POST /api/communities/[slug]/join error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
