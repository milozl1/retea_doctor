"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { posts, networkUsers } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { createPostSchema } from "@/lib/validators";
import { z } from "zod";

export async function createPost(
  data: z.infer<typeof createPostSchema>
): Promise<{ success: boolean; postId?: number; error?: string }> {
  try {
    const user = await requireAuth();
    const validated = createPostSchema.parse(data);

    // Ensure network user exists
    await db
      .insert(networkUsers)
      .values({
        userId: user.id,
        userName: user.firstName,
        userImageSrc: user.imageUrl,
        experienceLevel: "student",
      })
      .onConflictDoNothing();

    const [post] = await db
      .insert(posts)
      .values({
        userId: user.id,
        communityId: validated.communityId,
        title: validated.title,
        content: validated.content ?? "",
        type: validated.type as
          | "case_study"
          | "discussion"
          | "article"
          | "quick_question"
          | "external_link",
        linkUrl: validated.linkUrl ?? null,
        tags: validated.tags ?? [],
      })
      .returning({ id: posts.id });

    if (!post) throw new Error("Nu s-a putut crea postarea");

    // Increment user post count
    await db
      .update(networkUsers)
      .set({ postCount: sql`${networkUsers.postCount} + 1` })
      .where(eq(networkUsers.userId, user.id));

    revalidatePath("/");
    revalidatePath(`/post/${post.id}`);

    return { success: true, postId: post.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Date invalide" };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Eroare la creare",
    };
  }
}

export async function deletePost(
  postId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();

    const [post] = await db
      .select({ userId: posts.userId })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) return { success: false, error: "Postarea nu a fost găsită" };

    // Check ownership or admin
    const [netUser] = await db
      .select({ role: networkUsers.role })
      .from(networkUsers)
      .where(eq(networkUsers.userId, user.id))
      .limit(1);

    if (post.userId !== user.id && netUser?.role !== "admin") {
      return { success: false, error: "Nu ai permisiune" };
    }

    await db.update(posts).set({ isDeleted: true }).where(eq(posts.id, postId));

    // Decrement user post count
    await db
      .update(networkUsers)
      .set({ postCount: sql`GREATEST(${networkUsers.postCount} - 1, 0)` })
      .where(eq(networkUsers.userId, post.userId));

    revalidatePath("/");

    return { success: true };
  } catch {
    return { success: false, error: "Eroare la ștergere" };
  }
}
