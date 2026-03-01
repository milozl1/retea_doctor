import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { networkUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateProfileSchema = z.object({
  userName: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  specialization: z.string().max(100).optional(),
  experienceLevel: z.enum(["student", "rezident", "medic", "doctor"]).optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const [user] = await db
    .select()
    .from(networkUsers)
    .where(eq(networkUsers.userId, userId))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "Utilizatorul nu există" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Date invalide" },
      { status: 400 }
    );
  }

  const updates: Record<string, any> = {};
  if (parsed.data.userName !== undefined) updates.userName = parsed.data.userName;
  if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;
  if (parsed.data.specialization !== undefined) updates.specialization = parsed.data.specialization;
  if (parsed.data.experienceLevel !== undefined) updates.experienceLevel = parsed.data.experienceLevel;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Niciun câmp de actualizat" }, { status: 400 });
  }

  const [updated] = await db
    .update(networkUsers)
    .set(updates)
    .where(eq(networkUsers.userId, userId))
    .returning();

  return NextResponse.json({ user: updated });
}
