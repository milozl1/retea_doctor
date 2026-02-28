import { NextRequest, NextResponse } from "next/server";
import { getPostsForFeed } from "@/db/queries";
import { auth } from "@/lib/auth";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sort = (searchParams.get("sort") as "hot" | "new" | "top") || "hot";
  const cursor = searchParams.get("cursor")
    ? parseInt(searchParams.get("cursor")!)
    : undefined;
  const communityId = searchParams.get("communityId")
    ? parseInt(searchParams.get("communityId")!)
    : undefined;
  const limit = Math.min(
    parseInt(searchParams.get("limit") || "20"),
    50
  );

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
