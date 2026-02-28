import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { bookmarks, posts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const bookmarkSchema = z.object({
  postId: z.number().int().positive().optional(),
  commentId: z.number().int().positive().optional(),
}).refine((data) => data.postId !== undefined || data.commentId !== undefined, {
  message: "postId sau commentId este obligatoriu",
});

export async function GET(_request: NextRequest) {
  const start = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const results = await db
      .select({
        bookmark: bookmarks,
        post: posts,
      })
      .from(bookmarks)
      .leftJoin(posts, eq(bookmarks.postId, posts.id))
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt))
      .limit(50);

    const response = NextResponse.json({ bookmarks: results });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    console.error("GET /api/bookmarks error:", error);
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

    const body = await request.json();
    const data = bookmarkSchema.parse(body);

    // Check if already bookmarked
    const whereCondition = data.postId
      ? and(eq(bookmarks.userId, userId), eq(bookmarks.postId, data.postId))
      : and(eq(bookmarks.userId, userId), eq(bookmarks.commentId, data.commentId!));

    const [existing] = await db
      .select()
      .from(bookmarks)
      .where(whereCondition)
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: "Deja salvat" }, { status: 409 });
    }

    const [bookmark] = await db
      .insert(bookmarks)
      .values({ userId, postId: data.postId ?? null, commentId: data.commentId ?? null })
      .returning();

    const response = NextResponse.json({ bookmark }, { status: 201 });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }
    console.error("POST /api/bookmarks error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const start = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId")
      ? parseInt(searchParams.get("postId")!)
      : undefined;
    const commentId = searchParams.get("commentId")
      ? parseInt(searchParams.get("commentId")!)
      : undefined;

    if (!postId && !commentId) {
      return NextResponse.json({ error: "postId sau commentId necesar" }, { status: 400 });
    }

    const whereCondition = postId
      ? and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId))
      : and(eq(bookmarks.userId, userId), eq(bookmarks.commentId, commentId!));

    await db.delete(bookmarks).where(whereCondition);

    const response = NextResponse.json({ success: true });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    console.error("DELETE /api/bookmarks error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
