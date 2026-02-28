import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { posts, networkUsers, communities } from "@/db/schema";
import { auth } from "@/lib/auth";
import { updatePostSchema } from "@/lib/validators";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const start = Date.now();
  try {
    const { id } = await params;
    const postId = parseInt(id);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "ID invalid" }, { status: 400 });
    }

    const [result] = await db
      .select({
        post: posts,
        author: {
          userId: networkUsers.userId,
          userName: networkUsers.userName,
          userImageSrc: networkUsers.userImageSrc,
          karma: networkUsers.karma,
          isVerified: networkUsers.isVerified,
          experienceLevel: networkUsers.experienceLevel,
        },
        community: {
          id: communities.id,
          slug: communities.slug,
          name: communities.name,
          color: communities.color,
        },
      })
      .from(posts)
      .leftJoin(networkUsers, eq(posts.userId, networkUsers.userId))
      .leftJoin(communities, eq(posts.communityId, communities.id))
      .where(and(eq(posts.id, postId), eq(posts.isDeleted, false)))
      .limit(1);

    if (!result) {
      return NextResponse.json(
        { error: "Postarea nu a fost găsită" },
        { status: 404 }
      );
    }

    // Increment view count
    await db
      .update(posts)
      .set({ viewCount: sql`${posts.viewCount} + 1` })
      .where(eq(posts.id, postId));

    const response = NextResponse.json(result);
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    console.error("GET /api/posts/[id] error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const start = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { id } = await params;
    const postId = parseInt(id);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "ID invalid" }, { status: 400 });
    }

    const body = await request.json();
    const data = updatePostSchema.parse(body);

    const [existing] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, postId), eq(posts.isDeleted, false)))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Postarea nu a fost găsită" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    const [updated] = await db
      .update(posts)
      .set({ ...data, editedAt: new Date(), updatedAt: new Date() })
      .where(eq(posts.id, postId))
      .returning();

    const response = NextResponse.json({ post: updated });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }
    console.error("PUT /api/posts/[id] error:", error);
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
    const postId = parseInt(id);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "ID invalid" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, postId), eq(posts.isDeleted, false)))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Postarea nu a fost găsită" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
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
      .update(posts)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(posts.id, postId));

    const response = NextResponse.json({ success: true });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    console.error("DELETE /api/posts/[id] error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
