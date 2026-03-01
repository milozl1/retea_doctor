import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { networkUsers, posts, comments } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getNetworkUser } from "@/db/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getNetworkUser(params.id);
  if (!user) {
    return NextResponse.json(
      { error: "Utilizatorul nu a fost găsit" },
      { status: 404 }
    );
  }

  // Get user posts
  const userPosts = await db
    .select()
    .from(posts)
    .where(and(eq(posts.userId, params.id), eq(posts.isDeleted, false)))
    .orderBy(desc(posts.createdAt))
    .limit(20);

  return NextResponse.json({
    user,
    posts: userPosts,
  });
}
