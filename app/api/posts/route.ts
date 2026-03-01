import { NextRequest, NextResponse } from "next/server";
import { getPostsForFeed } from "@/db/queries";
import { auth, requireAuth } from "@/lib/auth";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { createPostSchema } from "@/lib/validators";
import { getOrCreateNetworkUser } from "@/db/queries";
import { db } from "@/db/drizzle";
import { posts, networkUsers, communities } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { calculateHotScore } from "@/lib/hot-score";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sort = (searchParams.get("sort") as "hot" | "new" | "top") || "hot";
  const cursor = searchParams.get("cursor")
    ? parseInt(searchParams.get("cursor")!)
    : undefined;

  // Accept both communityId (int) and community (slug)
  let communityId = searchParams.get("communityId")
    ? parseInt(searchParams.get("communityId")!)
    : undefined;

  const communitySlug = searchParams.get("community");
  if (!communityId && communitySlug) {
    const [comm] = await db
      .select({ id: communities.id })
      .from(communities)
      .where(eq(communities.slug, communitySlug))
      .limit(1);
    if (comm) communityId = comm.id;
  }

  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const { userId } = await auth();
  if (userId) {
    const rl = rateLimit(`posts:list:${userId}`, RATE_LIMITS.default);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Prea multe cereri. Încearcă mai târziu." },
        { status: 429 }
      );
    }
  }

  const results = await getPostsForFeed({
    communityId,
    sort,
    cursor,
    limit: limit + 1,
  });

  const hasMore = results.length > limit;
  const items = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? items[items.length - 1]?.post.id : undefined;

  return NextResponse.json({
    posts: items,
    nextCursor,
    hasMore,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userId, user } = await requireAuth();

    const rl = rateLimit(`posts:create:${userId}`, RATE_LIMITS.post);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Prea multe postări. Încearcă mai târziu." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Date invalide" },
        { status: 400 }
      );
    }

    await getOrCreateNetworkUser({
      userId,
      userName: user.firstName,
      userImageSrc: user.imageUrl,
    });

    const data = parsed.data;
    const now = new Date();
    const hotScoreVal = calculateHotScore(0, now);

    const [post] = await db
      .insert(posts)
      .values({
        userId,
        communityId: data.communityId,
        title: data.title,
        content: data.content,
        type: data.type,
        linkUrl: data.linkUrl || null,
        tags: data.tags,
        caseStudyId: data.caseStudyId || null,
        hotScore: hotScoreVal,
      })
      .returning();

    await db
      .update(networkUsers)
      .set({ postCount: sql`${networkUsers.postCount} + 1` })
      .where(eq(networkUsers.userId, userId));

    await db
      .update(communities)
      .set({ postCount: sql`${communities.postCount} + 1` })
      .where(eq(communities.id, data.communityId));

    return NextResponse.json({ id: post.id }, { status: 201 });
  } catch (err) {
    if ((err as any)?.message?.includes("NEXT_REDIRECT")) throw err;
    return NextResponse.json(
      { error: "Eroare internă la crearea postării" },
      { status: 500 }
    );
  }
}
