import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { posts, networkUsers, communities } from "@/db/schema";
import { eq, and, like, desc, or } from "drizzle-orm";
import { z } from "zod";

const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  communityId: z.coerce.number().int().positive().optional(),
  type: z.enum(["case_study", "discussion", "article", "quick_question", "external_link"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(request: NextRequest) {
  const start = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const params = searchQuerySchema.parse({
      q: searchParams.get("q"),
      communityId: searchParams.get("communityId") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });

    const offset = (params.page - 1) * params.limit;
    const searchPattern = `%${params.q}%`;

    const whereConditions = [
      eq(posts.isDeleted, false),
      or(like(posts.title, searchPattern), like(posts.content, searchPattern))!,
    ];

    if (params.communityId) {
      whereConditions.push(eq(posts.communityId, params.communityId));
    }

    if (params.type) {
      whereConditions.push(eq(posts.type, params.type));
    }

    const results = await db
      .select({
        post: posts,
        author: {
          userId: networkUsers.userId,
          userName: networkUsers.userName,
          userImageSrc: networkUsers.userImageSrc,
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
      .orderBy(desc(posts.score))
      .limit(params.limit)
      .offset(offset);

    const response = NextResponse.json({
      posts: results,
      query: params.q,
      page: params.page,
      hasMore: results.length === params.limit,
    });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Parametri invalizi" }, { status: 400 });
    }
    console.error("GET /api/search error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
