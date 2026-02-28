import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { posts, votes, networkUsers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { voteSchema } from "@/lib/validators";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";

interface Params {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: Params) {
  const start = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const limit = rateLimit(`votes:${userId}`, {
      windowMs: 60 * 1000,
      max: 30,
    });
    if (!limit.success) {
      return NextResponse.json(
        { error: "Prea multe voturi. Încearcă din nou." },
        { status: 429 }
      );
    }

    const postId = parseInt(params.id);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "ID invalid" }, { status: 400 });
    }

    const body = await request.json();
    const { type } = voteSchema.parse(body);

    // Check post exists and not own post
    const [post] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, postId), eq(posts.isDeleted, false)))
      .limit(1);

    if (!post) {
      return NextResponse.json(
        { error: "Postarea nu a fost găsită" },
        { status: 404 }
      );
    }

    if (post.userId === userId) {
      return NextResponse.json(
        { error: "Nu îți poți vota propria postare" },
        { status: 400 }
      );
    }

    // Check existing vote
    const [existingVote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, userId), eq(votes.postId, postId)))
      .limit(1);

    let newUpvotes = post.upvotes;
    let newDownvotes = post.downvotes;
    let karmaChange = 0;

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote (toggle)
        await db.delete(votes).where(eq(votes.id, existingVote.id));
        if (type === "upvote") {
          newUpvotes--;
          karmaChange = -1;
        } else {
          newDownvotes--;
          karmaChange = 1;
        }
      } else {
        // Change vote
        await db
          .update(votes)
          .set({ type })
          .where(eq(votes.id, existingVote.id));
        if (type === "upvote") {
          newUpvotes++;
          newDownvotes--;
          karmaChange = 2;
        } else {
          newDownvotes++;
          newUpvotes--;
          karmaChange = -2;
        }
      }
    } else {
      // New vote
      await db.insert(votes).values({ userId, postId, type });
      if (type === "upvote") {
        newUpvotes++;
        karmaChange = 1;
      } else {
        newDownvotes++;
        karmaChange = -1;
      }
    }

    const newScore = newUpvotes - newDownvotes;
    await db
      .update(posts)
      .set({
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        score: newScore,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));

    // Update author karma
    if (karmaChange !== 0) {
      await db
        .update(networkUsers)
        .set({ karma: sql`${networkUsers.karma} + ${karmaChange}` })
        .where(eq(networkUsers.userId, post.userId));
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
    console.error("POST /api/posts/[id]/vote error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
