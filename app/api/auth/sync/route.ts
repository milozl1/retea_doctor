import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { networkUsers } from "@/db/schema";
import { authWithUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(_request: NextRequest) {
  const start = Date.now();
  try {
    const { userId, user } = await authWithUser();
    if (!userId || !user) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const [existing] = await db
      .select()
      .from(networkUsers)
      .where(eq(networkUsers.userId, userId))
      .limit(1);

    if (existing) {
      // Update last seen and sync name/image
      const [updated] = await db
        .update(networkUsers)
        .set({
          userName: user.firstName,
          userImageSrc: user.imageUrl,
          lastSeenAt: new Date(),
        })
        .where(eq(networkUsers.userId, userId))
        .returning();

      const response = NextResponse.json({ user: updated });
      response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
      return response;
    }

    // Create new network user
    const [created] = await db
      .insert(networkUsers)
      .values({
        userId,
        userName: user.firstName,
        userImageSrc: user.imageUrl,
        experienceLevel: "student",
      })
      .returning();

    const response = NextResponse.json({ user: created }, { status: 201 });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    console.error("POST /api/auth/sync error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
