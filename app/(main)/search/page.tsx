import { db } from "@/db/drizzle";
import { posts, networkUsers, communities } from "@/db/schema";
import { eq, and, like, desc, or } from "drizzle-orm";
import { PostCard } from "@/components/feed/post-card";
import { SearchBar } from "@/components/search/search-bar";

interface PageProps {
  searchParams: { q?: string };
}

async function searchPosts(query: string) {
  if (!query) return [];
  try {
    const pattern = `%${query}%`;
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
      .from(posts)
      .leftJoin(networkUsers, eq(posts.userId, networkUsers.userId))
      .leftJoin(communities, eq(posts.communityId, communities.id))
      .where(
        and(
          eq(posts.isDeleted, false),
          or(like(posts.title, pattern), like(posts.content, pattern))
        )
      )
      .orderBy(desc(posts.score))
      .limit(20);
  } catch {
    return [];
  }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q ?? "";
  const results = await searchPosts(query);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white mb-4">Căutare</h1>
        <SearchBar />
      </div>

      {query && (
        <p className="text-slate-400 text-sm">
          {results.length} rezultate pentru &ldquo;{query}&rdquo;
        </p>
      )}

      {query && results.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white/5 border border-white/10 rounded-xl">
          <div className="text-5xl mb-4">🔍</div>
          <p>Niciun rezultat pentru &ldquo;{query}&rdquo;</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map(({ post, author, community }) => (
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
