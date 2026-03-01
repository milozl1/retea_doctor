import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { reports, posts, comments, networkUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["resolve", "dismiss", "ban_user"]),
  reportId: z.number().int().positive(),
  targetUserId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const start = Date.now();

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
  }

  // Check admin role
  const [netUser] = await db
    .select({ role: networkUsers.role })
    .from(networkUsers)
    .where(eq(networkUsers.userId, userId))
    .limit(1);

  if (!netUser || netUser.role !== "admin") {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  const rl = rateLimit(`moderation:${userId}`, { maxRequests: 60, windowMs: 60000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Prea multe cereri" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corp invalid" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Date invalide" },
      { status: 400 }
    );
  }

  const { action, reportId, targetUserId } = parsed.data;

  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.id, reportId))
    .limit(1);

  if (!report) {
    return NextResponse.json({ error: "Raport negăsit" }, { status: 404 });
  }

  try {
    switch (action) {
      case "resolve": {
        await db
          .update(reports)
          .set({
            status: "resolved",
            resolvedBy: userId,
            resolvedAt: new Date(),
          })
          .where(eq(reports.id, reportId));

        // Soft-delete reported content
        if (report.postId) {
          await db
            .update(posts)
            .set({ isDeleted: true })
            .where(eq(posts.id, report.postId));
        }
        if (report.commentId) {
          await db
            .update(comments)
            .set({ isDeleted: true })
            .where(eq(comments.id, report.commentId));
        }
        break;
      }

      case "dismiss": {
        await db
          .update(reports)
          .set({
            status: "dismissed",
            resolvedBy: userId,
            resolvedAt: new Date(),
          })
          .where(eq(reports.id, reportId));
        break;
      }

      case "ban_user": {
        if (!targetUserId) {
          return NextResponse.json(
            { error: "targetUserId necesar pentru ban" },
            { status: 400 }
          );
        }
        // Soft-delete all posts and comments from the user
        await db
          .update(posts)
          .set({ isDeleted: true })
          .where(eq(posts.userId, targetUserId));
        await db
          .update(comments)
          .set({ isDeleted: true })
          .where(eq(comments.userId, targetUserId));

        await db
          .update(reports)
          .set({
            status: "resolved",
            resolvedBy: userId,
            resolvedAt: new Date(),
          })
          .where(eq(reports.id, reportId));
        break;
      }
    }

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Server-Timing": `total;dur=${Date.now() - start}`,
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
