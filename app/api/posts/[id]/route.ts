import { NextRequest, NextResponse } from "next/server";
import { getPostById } from "@/db/queries";
import { auth } from "@/lib/auth";
import { getUserVoteOnPost, isPostBookmarked } from "@/db/queries";
import { db } from "@/db/drizzle";
import { posts, networkUsers, communities } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { updatePostSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = parseInt(params.id);
  if (isNaN(postId)) {
    return NextResponse.json({ error: "ID invalid" }, { status: 400 });
  }

  const result = await getPostById(postId);
  if (!result) {
    return NextResponse.json(
      { error: "Postarea nu a fost găsită" },
      { status: 404 }
    );
  }

  const { userId } = await auth();
  let userVote: "upvote" | "downvote" | null = null;
  let bookmarked = false;

  if (userId) {
    const [vote, bm] = await Promise.all([
      getUserVoteOnPost(userId, postId),
      isPostBookmarked(userId, postId),
    ]);
    userVote = vote?.type ?? null;
    bookmarked = bm;
  }

  return NextResponse.json({
    ...result,
    userVote,
    bookmarked,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const postId = parseInt(params.id);
  if (isNaN(postId)) {
    return NextResponse.json({ error: "ID invalid" }, { status: 400 });
  }

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    return NextResponse.json({ error: "Postarea nu există" }, { status: 404 });
  }

  // Check ownership or admin
  const [user] = await db
    .select({ role: networkUsers.role })
    .from(networkUsers)
    .where(eq(networkUsers.userId, userId))
    .limit(1);

  if (post.userId !== userId && user?.role !== "admin") {
    return NextResponse.json({ error: "Nu ai permisiunea să editezi" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Date invalide" },
      { status: 400 }
    );
  }

  const updates: Record<string, any> = { editedAt: new Date(), updatedAt: new Date() };
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.content !== undefined) updates.content = parsed.data.content;
  if (parsed.data.tags !== undefined) updates.tags = parsed.data.tags;

  // Admin-only fields: isPinned, isLocked, isDeleted
  if (user?.role === "admin") {
    if (typeof body.isPinned === "boolean") updates.isPinned = body.isPinned;
    if (typeof body.isLocked === "boolean") updates.isLocked = body.isLocked;
    if (typeof body.isDeleted === "boolean") updates.isDeleted = body.isDeleted;
  }

  const [updated] = await db
    .update(posts)
    .set(updates)
    .where(eq(posts.id, postId))
    .returning();

  return NextResponse.json({ post: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const postId = parseInt(params.id);
  if (isNaN(postId)) {
    return NextResponse.json({ error: "ID invalid" }, { status: 400 });
  }

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    return NextResponse.json({ error: "Postarea nu există" }, { status: 404 });
  }

  const [user] = await db
    .select({ role: networkUsers.role })
    .from(networkUsers)
    .where(eq(networkUsers.userId, userId))
    .limit(1);

  if (post.userId !== userId && user?.role !== "admin") {
    return NextResponse.json({ error: "Nu ai permisiunea să ștergi" }, { status: 403 });
  }

  await db
    .update(posts)
    .set({ isDeleted: true })
    .where(eq(posts.id, postId));

  // Decrement counts
  await db
    .update(networkUsers)
    .set({ postCount: sql`GREATEST(${networkUsers.postCount} - 1, 0)` })
    .where(eq(networkUsers.userId, post.userId));

  await db
    .update(communities)
    .set({ postCount: sql`GREATEST(${communities.postCount} - 1, 0)` })
    .where(eq(communities.id, post.communityId));

  return NextResponse.json({ success: true });
}
