import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { networkUsers, posts, comments } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const start = Date.now();
  try {
    const { id } = await params;
    const [user] = await db
      .select()
      .from(networkUsers)
      .where(eq(networkUsers.userId, id))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    const userPosts = await db
      .select()
      .from(posts)
      .where(and(eq(posts.userId, id), eq(posts.isDeleted, false)))
      .orderBy(desc(posts.createdAt))
      .limit(10);

    const userComments = await db
      .select()
      .from(comments)
      .where(and(eq(comments.userId, id), eq(comments.isDeleted, false)))
      .orderBy(desc(comments.createdAt))
      .limit(10);

    const response = NextResponse.json({
      user,
      recentPosts: userPosts,
      recentComments: userComments,
    });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    console.error("GET /api/user/[id] error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
