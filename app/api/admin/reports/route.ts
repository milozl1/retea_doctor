import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { reports, networkUsers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { reportSchema } from "@/lib/validators";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

export async function GET(_request: NextRequest) {
  const start = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const [user] = await db
      .select({ role: networkUsers.role })
      .from(networkUsers)
      .where(eq(networkUsers.userId, userId))
      .limit(1);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    const results = await db
      .select()
      .from(reports)
      .where(eq(reports.status, "pending"))
      .orderBy(desc(reports.createdAt))
      .limit(50);

    const response = NextResponse.json({ reports: results });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    console.error("GET /api/admin/reports error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const start = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const body = await request.json();
    const data = reportSchema.parse(body);

    const [report] = await db
      .insert(reports)
      .values({
        reporterId: userId,
        postId: data.postId ?? null,
        commentId: data.commentId ?? null,
        reason: data.reason,
        details: data.details ?? null,
        status: "pending",
      })
      .returning();

    const response = NextResponse.json({ report }, { status: 201 });
    response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }
    console.error("POST /api/admin/reports error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
