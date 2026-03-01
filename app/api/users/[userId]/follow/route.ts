import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { follows, networkUsers } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// GET — check follow status + counts
export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = await auth();

  const [followersCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(follows)
    .where(eq(follows.followingId, params.userId));

  const [followingCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(follows)
    .where(eq(follows.followerId, params.userId));

  let isFollowing = false;
  if (userId && userId !== params.userId) {
    const [existing] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, userId),
          eq(follows.followingId, params.userId)
        )
      )
      .limit(1);
    isFollowing = !!existing;
  }

  return NextResponse.json({
    followersCount: followersCount?.count ?? 0,
    followingCount: followingCount?.count ?? 0,
    isFollowing,
  });
}

// POST — toggle follow/unfollow
export async function POST(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  if (userId === params.userId) {
    return NextResponse.json(
      { error: "Nu te poți urmări pe tine" },
      { status: 400 }
    );
  }

  // Check target user exists
  const [target] = await db
    .select({ userId: networkUsers.userId })
    .from(networkUsers)
    .where(eq(networkUsers.userId, params.userId))
    .limit(1);

  if (!target) {
    return NextResponse.json(
      { error: "Utilizator negăsit" },
      { status: 404 }
    );
  }

  // Check existing follow
  const [existing] = await db
    .select()
    .from(follows)
    .where(
      and(
        eq(follows.followerId, userId),
        eq(follows.followingId, params.userId)
      )
    )
    .limit(1);

  if (existing) {
    // Unfollow
    await db.delete(follows).where(eq(follows.id, existing.id));
    return NextResponse.json({ following: false });
  } else {
    // Follow
    await db.insert(follows).values({
      followerId: userId,
      followingId: params.userId,
    });
    return NextResponse.json({ following: true });
  }
}
