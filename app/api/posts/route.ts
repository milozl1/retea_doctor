import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { posts, networkUsers, communities } from "@/db/schema";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createPostSchema, paginationSchema } from "@/lib/validators";
import { eq, desc, and, sql } from "drizzle-orm";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const start = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const params = paginationSchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
      sort: searchParams.get("sort") ?? "hot",
      communityId: searchParams.get("communityId") ?? undefined,
    });

    const offset = (params.page - 1) * params.limit;
    const whereConditions = [eq(posts.isDeleted, false)];

    if (params.communityId) {
      whereConditions.push(eq(posts.communityId, params.communityId));
    }

    let orderBy;
    if (params.sort === "new") {
      orderBy = desc(posts.createdAt);
    } else if (params.sort === "top") {
      orderBy = desc(posts.score);
    } else {
      // hot - order by score + recency
      orderBy = desc(posts.createdAt);
    }

    const results = await db
      .select({
        post: posts,
        author: {
          userId: networkUsers.userId,
          userName: networkUsers.userName,
          userImageSrc: networkUsers.userImageSrc,
          karma: networkUsers.karma,
          isVerified: networkUsers.isVerified,
        },
        community: {
          id: communities.id,
          slug: communities.slug,
          name: communities.name,
          color: communities.color,
        },
      })
      .from(posts)
      .leftJoin(networkUsers, eq(posts.userId, networkUsers.userId))
      .leftJoin(communities, eq(posts.communityId, communities.id))
      .where(and(...whereConditions))
      .orderBy(orderBy)
      .limit(params.limit)
      .offset(offset);

    const response = NextResponse.json({
      posts: results,
      page: params.page,
      hasMore: results.length === params.limit,
    });

    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Parametri invalizi" }, { status: 400 });
    }
    console.error("GET /api/posts error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const start = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const limit = rateLimit(`posts:${userId}`, {
      windowMs: 60 * 60 * 1000,
      max: 5,
    });
    if (!limit.success) {
      return NextResponse.json(
        { error: "Prea multe postări. Încearcă din nou mai târziu." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const data = createPostSchema.parse(body);

    // Ensure user exists in network_users
    const [existingUser] = await db
      .select()
      .from(networkUsers)
      .where(eq(networkUsers.userId, userId))
      .limit(1);

    if (!existingUser) {
      return NextResponse.json(
        { error: "Profil inexistent. Conectează-te mai întâi." },
        { status: 403 }
      );
    }

    const [post] = await db
      .insert(posts)
      .values({
        userId,
        communityId: data.communityId,
        title: data.title,
        content: data.content ?? "",
        type: data.type,
        linkUrl: data.linkUrl ?? null,
        tags: data.tags ?? [],
        caseStudyId: data.caseStudyId ?? null,
      })
      .returning();

    // Update community post count and user post count
    await db
      .update(communities)
      .set({ postCount: sql`${communities.postCount} + 1` })
      .where(eq(communities.id, data.communityId));

    await db
      .update(networkUsers)
      .set({ postCount: sql`${networkUsers.postCount} + 1` })
      .where(eq(networkUsers.userId, userId));

    const response = NextResponse.json({ post }, { status: 201 });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Date invalide", details: error.issues },
        { status: 400 }
      );
    }
    console.error("POST /api/posts error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
