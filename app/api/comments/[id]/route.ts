import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { comments, posts, networkUsers } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { updateCommentSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const commentId = parseInt(params.id);
  if (isNaN(commentId)) {
    return NextResponse.json({ error: "ID invalid" }, { status: 400 });
  }

  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!comment) {
    return NextResponse.json({ error: "Comentariul nu există" }, { status: 404 });
  }

  const [user] = await db
    .select({ role: networkUsers.role })
    .from(networkUsers)
    .where(eq(networkUsers.userId, userId))
    .limit(1);

  if (comment.userId !== userId && user?.role !== "admin") {
    return NextResponse.json({ error: "Nu ai permisiunea" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Date invalide" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(comments)
    .set({
      content: parsed.data.content,
      editedAt: new Date(),
    })
    .where(eq(comments.id, commentId))
    .returning();

  return NextResponse.json({ comment: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const commentId = parseInt(params.id);
  if (isNaN(commentId)) {
    return NextResponse.json({ error: "ID invalid" }, { status: 400 });
  }

  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!comment) {
    return NextResponse.json({ error: "Comentariul nu există" }, { status: 404 });
  }

  const [user] = await db
    .select({ role: networkUsers.role })
    .from(networkUsers)
    .where(eq(networkUsers.userId, userId))
    .limit(1);

  if (comment.userId !== userId && user?.role !== "admin") {
    return NextResponse.json({ error: "Nu ai permisiunea" }, { status: 403 });
  }

  await db
    .update(comments)
    .set({ isDeleted: true })
    .where(eq(comments.id, commentId));

  // Decrement comment count on post
  await db
    .update(posts)
    .set({ commentCount: sql`GREATEST(${posts.commentCount} - 1, 0)` })
    .where(eq(posts.id, comment.postId));

  await db
    .update(networkUsers)
    .set({ commentCount: sql`GREATEST(${networkUsers.commentCount} - 1, 0)` })
    .where(eq(networkUsers.userId, comment.userId));

  return NextResponse.json({ success: true });
}
