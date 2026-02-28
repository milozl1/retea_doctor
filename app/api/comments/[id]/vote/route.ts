import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { comments, votes, networkUsers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { voteSchema } from "@/lib/validators";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const start = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const limit = rateLimit(`votes:${userId}`, { windowMs: 60 * 1000, max: 30 });
    if (!limit.success) {
      return NextResponse.json({ error: "Prea multe voturi." }, { status: 429 });
    }

    const { id } = await params;
    const commentId = parseInt(id);
    if (isNaN(commentId)) {
      return NextResponse.json({ error: "ID invalid" }, { status: 400 });
    }

    const body = await request.json();
    const { type } = voteSchema.parse(body);

    const [comment] = await db
      .select()
      .from(comments)
      .where(and(eq(comments.id, commentId), eq(comments.isDeleted, false)))
      .limit(1);

    if (!comment) {
      return NextResponse.json({ error: "Comentariul nu a fost găsit" }, { status: 404 });
    }

    if (comment.userId === userId) {
      return NextResponse.json({ error: "Nu îți poți vota propriul comentariu" }, { status: 400 });
    }

    const [existingVote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, userId), eq(votes.commentId, commentId)))
      .limit(1);

    let newUpvotes = comment.upvotes;
    let newDownvotes = comment.downvotes;
    let karmaChange = 0;

    if (existingVote) {
      if (existingVote.type === type) {
        await db.delete(votes).where(eq(votes.id, existingVote.id));
        if (type === "upvote") { newUpvotes--; karmaChange = -1; }
        else { newDownvotes--; karmaChange = 1; }
      } else {
        await db.update(votes).set({ type }).where(eq(votes.id, existingVote.id));
        if (type === "upvote") { newUpvotes++; newDownvotes--; karmaChange = 2; }
        else { newDownvotes++; newUpvotes--; karmaChange = -2; }
      }
    } else {
      await db.insert(votes).values({ userId, commentId, type });
      if (type === "upvote") { newUpvotes++; karmaChange = 1; }
      else { newDownvotes++; karmaChange = -1; }
    }

    const newScore = newUpvotes - newDownvotes;
    await db.update(comments)
      .set({ upvotes: newUpvotes, downvotes: newDownvotes, score: newScore })
      .where(eq(comments.id, commentId));

    if (karmaChange !== 0) {
      await db.update(networkUsers)
        .set({ karma: sql`${networkUsers.karma} + ${karmaChange}` })
        .where(eq(networkUsers.userId, comment.userId));
    }

    const response = NextResponse.json({
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      score: newScore,
      userVote: existingVote?.type === type ? null : type,
    });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }
    console.error("POST /api/comments/[id]/vote error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
