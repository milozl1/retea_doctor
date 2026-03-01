import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { follows, networkUsers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET — following list for a user
export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const following = await db
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
    .innerJoin(networkUsers, eq(follows.followingId, networkUsers.userId))
    .where(eq(follows.followerId, params.userId))
    .orderBy(desc(follows.createdAt))
    .limit(100);

  return NextResponse.json({ following });
}
