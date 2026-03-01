import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { communities, networkUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const createCommunitySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(2000).default(""),
  rules: z.string().max(5000).default(""),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#2196F3"),
  iconSrc: z.string().max(10).optional(),
});

const updateCommunitySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(2000).optional(),
  rules: z.string().max(5000).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  iconSrc: z.string().max(10).optional(),
});

// POST — create community (admin only)
export async function POST(req: NextRequest) {
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

  const body = await req.json();
  const parsed = createCommunitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Date invalide" },
      { status: 400 }
    );
  }

  const slug = slugify(parsed.data.name);

  // Check slug uniqueness
  const [existing] = await db
    .select({ id: communities.id })
    .from(communities)
    .where(eq(communities.slug, slug))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "O comunitate cu acest nume există deja" },
      { status: 409 }
    );
  }

  const [created] = await db
    .insert(communities)
    .values({
      slug,
      name: parsed.data.name,
      description: parsed.data.description,
      rules: parsed.data.rules,
      color: parsed.data.color,
      iconSrc: parsed.data.iconSrc || null,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}

// PATCH — update community (admin only)
export async function PATCH(req: NextRequest) {
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

  const body = await req.json();
  const { communityId, ...updateData } = body;

  if (!communityId || typeof communityId !== "number") {
    return NextResponse.json({ error: "communityId requis" }, { status: 400 });
  }

  const parsed = updateCommunitySchema.safeParse(updateData);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Date invalide" },
      { status: 400 }
    );
  }

  const updateFields: Record<string, any> = { updatedAt: new Date() };
  if (parsed.data.name) updateFields.name = parsed.data.name;
  if (parsed.data.description !== undefined) updateFields.description = parsed.data.description;
  if (parsed.data.rules !== undefined) updateFields.rules = parsed.data.rules;
  if (parsed.data.color) updateFields.color = parsed.data.color;
  if (parsed.data.iconSrc !== undefined) updateFields.iconSrc = parsed.data.iconSrc;

  await db
    .update(communities)
    .set(updateFields)
    .where(eq(communities.id, communityId));

  return NextResponse.json({ success: true });
}
