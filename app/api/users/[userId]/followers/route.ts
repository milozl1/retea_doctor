import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { follows, networkUsers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET — followers list for a user
export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const followers = await db
    .select({
      userId: networkUsers.userId,
      userName: networkUsers.userName,
      userImageSrc: networkUsers.userImageSrc,
      specialization: networkUsers.specialization,
      experienceLevel: networkUsers.experienceLevel,
      isVerified: networkUsers.isVerified,
      karma: networkUsers.karma,
      followedAt: follows.createdAt,
    })
    .from(follows)
    .innerJoin(networkUsers, eq(follows.followerId, networkUsers.userId))
    .where(eq(follows.followingId, params.userId))
    .orderBy(desc(follows.createdAt))
    .limit(100);

  return NextResponse.json({ followers });
}
