import { requireAuth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { bookmarks, posts, networkUsers, communities } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { PostCard } from "@/components/feed/post-card";

export const metadata = {
  title: "Salvate — MedRețea",
};

async function getSavedPosts(userId: string) {
  try {
    return await db
      .select({
        post: posts,
        author: {
          userId: networkUsers.userId,
          userName: networkUsers.userName,
          userImageSrc: networkUsers.userImageSrc,
          karma: networkUsers.karma,
          isVerified: networkUsers.isVerified,
        },
        community: {
          id: communities.id,
          slug: communities.slug,
          name: communities.name,
          color: communities.color,
        },
      })
      .from(bookmarks)
      .innerJoin(posts, eq(bookmarks.postId, posts.id))
      .leftJoin(networkUsers, eq(posts.userId, networkUsers.userId))
      .leftJoin(communities, eq(posts.communityId, communities.id))
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt))
      .limit(50);
  } catch {
    return [];
  }
}

export default async function SavedPage() {
  const user = await requireAuth();
  const saved = await getSavedPosts(user.id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Postări salvate</h1>

      {saved.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white/5 border border-white/10 rounded-xl">
          <div className="text-5xl mb-4">🔖</div>
          <p>Nicio postare salvată</p>
          <p className="text-sm mt-1">Salvează postări interesante pentru a le reciti mai târziu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {saved.map(({ post, author, community }) => (
            <PostCard
              key={post.id}
              post={post}
              author={author}
              community={community}
            />
          ))}
        </div>
      )}
    </div>
  );
}
