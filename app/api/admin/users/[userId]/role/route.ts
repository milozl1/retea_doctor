import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { networkUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId: currentUserId } = await requireAuth();

  // Check admin
  const [currentUser] = await db
    .select()
    .from(networkUsers)
    .where(eq(networkUsers.userId, currentUserId))
    .limit(1);

  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  const body = await request.json();
  const role = body.role;

  if (!["user", "moderator", "admin"].includes(role)) {
    return NextResponse.json({ error: "Rol invalid" }, { status: 400 });
  }

  // Prevent demoting yourself
  if (params.userId === currentUserId && role !== "admin") {
    return NextResponse.json(
      { error: "Nu îți poți schimba propriul rol" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(networkUsers)
    .set({ role })
    .where(eq(networkUsers.userId, params.userId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Utilizatorul nu a fost găsit" }, { status: 404 });
  }

  return NextResponse.json({ user: { userId: updated.userId, role: updated.role } });
}
