import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleBookmark } from "@/actions/vote-actions";
import { db } from "@/db/drizzle";
import { bookmarks, posts, networkUsers, communities } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const results = await db
    .select({
      bookmark: bookmarks,
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
    .from(bookmarks)
    .innerJoin(posts, eq(bookmarks.postId, posts.id))
    .innerJoin(networkUsers, eq(posts.userId, networkUsers.userId))
    .innerJoin(communities, eq(posts.communityId, communities.id))
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt));

  return NextResponse.json({ bookmarks: results });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await request.json();
  const { postId } = body;

  if (!postId || typeof postId !== "number") {
    return NextResponse.json({ error: "postId invalid" }, { status: 400 });
  }

  const result = await toggleBookmark(postId);
  return NextResponse.json(result);
}
