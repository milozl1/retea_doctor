import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { reports, networkUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await requireAuth();

  // Check admin
  const [user] = await db
    .select()
    .from(networkUsers)
    .where(eq(networkUsers.userId, userId))
    .limit(1);

  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  const reportId = parseInt(params.id);
  if (isNaN(reportId)) {
    return NextResponse.json({ error: "ID invalid" }, { status: 400 });
  }

  const body = await request.json();
  const status = body.status;

  if (!["resolved", "dismissed", "reviewed"].includes(status)) {
    return NextResponse.json({ error: "Status invalid" }, { status: 400 });
  }

  const [updated] = await db
    .update(reports)
    .set({
      status,
      resolvedBy: userId,
      resolvedAt: new Date(),
    })
    .where(eq(reports.id, reportId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Raportul nu a fost găsit" }, { status: 404 });
  }

  return NextResponse.json({ report: updated });
}
