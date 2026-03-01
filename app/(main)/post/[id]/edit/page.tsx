import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { posts, communities, networkUsers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { EditPostForm } from "@/components/post/edit-post-form";

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  const postId = parseInt(params.id);
  if (isNaN(postId)) {
    notFound();
  }

  const { userId } = await requireAuth();

  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.isDeleted, false)))
    .limit(1);

  if (!post) {
    notFound();
  }

  // Check ownership or admin
  const [user] = await db
    .select({ role: networkUsers.role })
    .from(networkUsers)
    .where(eq(networkUsers.userId, userId))
    .limit(1);

  if (post.userId !== userId && user?.role !== "admin") {
    redirect(`/post/${postId}`);
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-6">
        <h1 className="text-xl font-bold text-white mb-1">
          ✏️ Editează postarea
        </h1>
        <p className="text-slate-400 text-sm">
          Modifică titlul, conținutul sau tag-urile postării.
        </p>
      </div>

      <div className="glass-card p-6">
        <EditPostForm
          postId={post.id}
          initialTitle={post.title}
          initialContent={post.content}
          initialTags={post.tags}
        />
      </div>
    </div>
  );
}
