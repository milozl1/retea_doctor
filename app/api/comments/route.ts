import { NextRequest, NextResponse } from "next/server";
import { getCommentsForPost } from "@/db/queries";
import { requireAuth } from "@/lib/auth";
import { getOrCreateNetworkUser } from "@/db/queries";
import { createCommentSchema } from "@/lib/validators";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { db } from "@/db/drizzle";
import { comments, posts, networkUsers, notifications } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = parseInt(searchParams.get("postId") || "0");
  const sort =
    (searchParams.get("sort") as "best" | "new" | "old") || "best";

  if (!postId) {
    return NextResponse.json({ error: "postId este obligatoriu" }, { status: 400 });
  }

  const results = await getCommentsForPost(postId, sort);

  return NextResponse.json({ comments: results });
}

export async function POST(request: NextRequest) {
  try {
    const { userId, user } = await requireAuth();

    const rl = rateLimit(`comments:create:${userId}`, RATE_LIMITS.comment);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Prea multe comentarii. Încearcă mai târziu." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = createCommentSchema.safeParse(body);
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

    const { postId, content, parentId } = parsed.data;

    // Verify post exists and isn't locked
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: "Postarea nu există" }, { status: 404 });
    }

    if (post.isLocked) {
      return NextResponse.json({ error: "Postarea este blocată" }, { status: 403 });
    }

    // Calculate depth from parent
    let depth = 0;
    if (parentId) {
      const [parent] = await db
        .select({ depth: comments.depth })
        .from(comments)
        .where(eq(comments.id, parentId))
        .limit(1);
      if (parent) depth = Math.min(parent.depth + 1, 5);
    }

    const [comment] = await db
      .insert(comments)
      .values({
        postId,
        userId,
        content,
        parentId: parentId || null,
        depth,
      })
      .returning();

    // Update denormalized counts
    await db
      .update(posts)
      .set({ commentCount: sql`${posts.commentCount} + 1` })
      .where(eq(posts.id, postId));

    await db
      .update(networkUsers)
      .set({ commentCount: sql`${networkUsers.commentCount} + 1` })
      .where(eq(networkUsers.userId, userId));

    // Notify post author (if different from commenter)
    if (post.userId !== userId) {
      await db.insert(notifications).values({
        userId: post.userId,
        actorId: userId,
        type: "reply_post",
        postId,
        commentId: comment.id,
        message: "a comentat la postarea ta",
      });
    }

    // Notify parent comment author (if replying)
    if (parentId) {
      const [parentComment] = await db
        .select({ userId: comments.userId })
        .from(comments)
        .where(eq(comments.id, parentId))
        .limit(1);

      if (parentComment && parentComment.userId !== userId && parentComment.userId !== post.userId) {
        await db.insert(notifications).values({
          userId: parentComment.userId,
          actorId: userId,
          type: "reply_comment",
          postId,
          commentId: comment.id,
          message: "a răspuns la comentariul tău",
        });
      }
    }

    return NextResponse.json({ id: comment.id }, { status: 201 });
  } catch (err) {
    if ((err as any)?.message?.includes("NEXT_REDIRECT")) throw err;
    return NextResponse.json(
      { error: "Eroare internă la adăugarea comentariului" },
      { status: 500 }
    );
  }
}
