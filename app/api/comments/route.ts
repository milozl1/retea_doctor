import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { comments, posts, networkUsers, notifications } from "@/db/schema";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createCommentSchema } from "@/lib/validators";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { z } from "zod";
import { COMMENT_MAX_DEPTH } from "@/config/constants";

export async function GET(request: NextRequest) {
  const start = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const postId = parseInt(searchParams.get("postId") ?? "0");
    const sort = searchParams.get("sort") ?? "best";

    if (!postId) {
      return NextResponse.json({ error: "postId este obligatoriu" }, { status: 400 });
    }

    let orderBy;
    if (sort === "new") orderBy = desc(comments.createdAt);
    else if (sort === "old") orderBy = asc(comments.createdAt);
    else if (sort === "controversial") orderBy = desc(comments.downvotes);
    else orderBy = desc(comments.score); // best

    const results = await db
      .select({
        comment: comments,
        author: {
          userId: networkUsers.userId,
          userName: networkUsers.userName,
          userImageSrc: networkUsers.userImageSrc,
          isVerified: networkUsers.isVerified,
        },
      })
      .from(comments)
      .leftJoin(networkUsers, eq(comments.userId, networkUsers.userId))
      .where(eq(comments.postId, postId))
      .orderBy(orderBy);

    const response = NextResponse.json({ comments: results });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    console.error("GET /api/comments error:", error);
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

    const limit = rateLimit(`comments:${userId}`, {
      windowMs: 60 * 1000,
      max: 20,
    });
    if (!limit.success) {
      return NextResponse.json(
        { error: "Prea multe comentarii. Încearcă din nou." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const data = createCommentSchema.parse(body);

    // Check post exists
    const [post] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, data.postId), eq(posts.isDeleted, false)))
      .limit(1);

    if (!post) {
      return NextResponse.json(
        { error: "Postarea nu a fost găsită" },
        { status: 404 }
      );
    }

    if (post.isLocked) {
      return NextResponse.json(
        { error: "Postarea este blocată pentru comentarii" },
        { status: 403 }
      );
    }

    let depth = 0;
    if (data.parentId) {
      const [parent] = await db
        .select()
        .from(comments)
        .where(eq(comments.id, data.parentId))
        .limit(1);

      if (!parent) {
        return NextResponse.json(
          { error: "Comentariul părinte nu a fost găsit" },
          { status: 404 }
        );
      }
      depth = Math.min(parent.depth + 1, COMMENT_MAX_DEPTH);
    }

    const [comment] = await db
      .insert(comments)
      .values({
        postId: data.postId,
        userId,
        parentId: data.parentId ?? null,
        content: data.content,
        depth,
      })
      .returning();

    // Update post comment count
    await db
      .update(posts)
      .set({ commentCount: sql`${posts.commentCount} + 1` })
      .where(eq(posts.id, data.postId));

    // Update user comment count
    await db
      .update(networkUsers)
      .set({ commentCount: sql`${networkUsers.commentCount} + 1` })
      .where(eq(networkUsers.userId, userId));

    // Create notification for post author (if not own comment)
    if (post.userId !== userId) {
      await db.insert(notifications).values({
        userId: post.userId,
        actorId: userId,
        type: "reply_post",
        postId: data.postId,
        commentId: comment.id,
        message: `A comentat la postarea ta: "${data.content.slice(0, 100)}"`,
      });
    }

    // Create notification for parent comment author (if reply)
    if (data.parentId) {
      const [parentComment] = await db
        .select()
        .from(comments)
        .where(eq(comments.id, data.parentId))
        .limit(1);

      if (parentComment && parentComment.userId !== userId) {
        await db.insert(notifications).values({
          userId: parentComment.userId,
          actorId: userId,
          type: "reply_comment",
          postId: data.postId,
          commentId: comment.id,
          message: `A răspuns la comentariul tău: "${data.content.slice(0, 100)}"`,
        });
      }
    }

    const response = NextResponse.json({ comment }, { status: 201 });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Date invalide", details: error.issues },
        { status: 400 }
      );
    }
    console.error("POST /api/comments error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
