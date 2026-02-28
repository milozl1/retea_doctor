"use server";

import { db } from "@/db/drizzle";
import { posts, networkUsers, communities } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { getOrCreateNetworkUser } from "@/db/queries";
import { createPostSchema } from "@/lib/validators";
import { hotScore } from "@/lib/hot-score";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createPost(formData: unknown) {
  const { userId, user } = await requireAuth();

  const parsed = createPostSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Date invalide" };
  }

  const networkUser = await getOrCreateNetworkUser({
    userId,
    userName: user.firstName,
    userImageSrc: user.imageUrl,
  });

  const data = parsed.data;
  const now = new Date();
  const score = hotScore(0, 0, now);

  const [post] = await db
    .insert(posts)
    .values({
      userId,
      communityId: data.communityId,
      title: data.title,
      content: data.content,
      type: data.type,
      linkUrl: data.linkUrl || null,
      tags: data.tags,
      caseStudyId: data.caseStudyId || null,
      hotScore: Math.round(score * 10000000),
    })
    .returning();

  // Update denormalized counts
  await db
    .update(networkUsers)
    .set({ postCount: sql`${networkUsers.postCount} + 1` })
    .where(eq(networkUsers.userId, userId));

  await db
    .update(communities)
    .set({ postCount: sql`${communities.postCount} + 1` })
    .where(eq(communities.id, data.communityId));

  revalidatePath("/");
  return { id: post.id };
}

export async function deletePost(postId: number) {
  const { userId } = await requireAuth();

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post || post.userId !== userId) {
    return { error: "Nu poți șterge această postare" };
  }

  await db
    .update(posts)
    .set({ isDeleted: true })
    .where(eq(posts.id, postId));

  revalidatePath("/");
  return { success: true };
}
