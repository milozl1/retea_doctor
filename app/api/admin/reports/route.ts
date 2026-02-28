import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { reports, networkUsers, posts } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  // Check if user is admin
  const [user] = await db
    .select()
    .from(networkUsers)
    .where(eq(networkUsers.userId, userId))
    .limit(1);

  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";

  const allReports = await db
    .select({
      report: reports,
      reporter: {
        userId: networkUsers.userId,
        userName: networkUsers.userName,
      },
    })
    .from(reports)
    .innerJoin(networkUsers, eq(reports.reporterId, networkUsers.userId))
    .where(eq(reports.status, status as any))
    .orderBy(desc(reports.createdAt))
    .limit(50);

  return NextResponse.json({ reports: allReports });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await request.json();
  const { postId, commentId, reason, description } = body;

  if (!reason) {
    return NextResponse.json(
      { error: "Motivul este obligatoriu" },
      { status: 400 }
    );
  }

  await db.insert(reports).values({
    reporterId: userId,
    postId: postId || null,
    commentId: commentId || null,
    reason,
    details: description || null,
  });

  return NextResponse.json({ success: true });
}
