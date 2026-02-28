import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { comments, networkUsers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { updateCommentSchema } from "@/lib/validators";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { COMMENT_EDIT_WINDOW_MS } from "@/config/constants";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: Params) {
  const start = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { id } = await params;
    const commentId = parseInt(id);
    if (isNaN(commentId)) {
      return NextResponse.json({ error: "ID invalid" }, { status: 400 });
    }

    const body = await request.json();
    const data = updateCommentSchema.parse(body);

    const [comment] = await db
      .select()
      .from(comments)
      .where(and(eq(comments.id, commentId), eq(comments.isDeleted, false)))
      .limit(1);

    if (!comment) {
      return NextResponse.json(
        { error: "Comentariul nu a fost găsit" },
        { status: 404 }
      );
    }

    if (comment.userId !== userId) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    // Check edit window
    const now = Date.now();
    const commentAge = now - comment.createdAt.getTime();
    if (commentAge > COMMENT_EDIT_WINDOW_MS) {
      return NextResponse.json(
        { error: "Fereastra de editare a expirat (15 minute)" },
        { status: 403 }
      );
    }

    const [updated] = await db
      .update(comments)
      .set({ content: data.content, editedAt: new Date() })
      .where(eq(comments.id, commentId))
      .returning();

    const response = NextResponse.json({ comment: updated });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }
    console.error("PUT /api/comments/[id] error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const start = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { id } = await params;
    const commentId = parseInt(id);
    if (isNaN(commentId)) {
      return NextResponse.json({ error: "ID invalid" }, { status: 400 });
    }

    const [comment] = await db
      .select()
      .from(comments)
      .where(and(eq(comments.id, commentId), eq(comments.isDeleted, false)))
      .limit(1);

    if (!comment) {
      return NextResponse.json(
        { error: "Comentariul nu a fost găsit" },
        { status: 404 }
      );
    }

    if (comment.userId !== userId) {
      // Check if admin
      const [user] = await db
        .select({ role: networkUsers.role })
        .from(networkUsers)
        .where(eq(networkUsers.userId, userId))
        .limit(1);

      if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
      }
    }

    // Soft delete
    await db
      .update(comments)
      .set({ isDeleted: true })
      .where(eq(comments.id, commentId));

    const response = NextResponse.json({ success: true });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    console.error("DELETE /api/comments/[id] error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
