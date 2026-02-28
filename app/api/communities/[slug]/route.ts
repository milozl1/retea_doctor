import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { communities, communityMemberships } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const start = Date.now();
  try {
    const { slug } = await params;
    const { userId } = await auth();

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

    const response = NextResponse.json({ community: { ...community, isMember } });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    console.error("GET /api/communities/[slug] error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
