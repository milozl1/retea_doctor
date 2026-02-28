import { getPostsForFeed } from "@/db/queries";
import { PostList } from "./post-list";

interface PostListServerProps {
  sort: string;
  communityId?: number;
  communitySlug?: string;
}

export async function PostListServer({
  sort,
  communityId,
  communitySlug,
}: PostListServerProps) {
  const validSort = (["hot", "new", "top"] as const).includes(
    sort as "hot" | "new" | "top"
  )
    ? (sort as "hot" | "new" | "top")
    : "hot";

  const results = await getPostsForFeed({
    communityId,
    sort: validSort,
    limit: 20,
  });

  // Transform to match PostList's PostData interface
  const initialPosts = results.map((r) => ({
    post: {
      id: r.post.id,
      title: r.post.title,
      content: r.post.content,
      type: r.post.type,
      score: r.post.score,
      commentCount: r.post.commentCount,
      viewCount: r.post.viewCount,
      createdAt: r.post.createdAt.toISOString(),
      tags: r.post.tags ?? [],
      isPinned: r.post.isPinned,
    },
    author: {
      userId: r.author.userId,
      userName: r.author.userName,
      userImageSrc: r.author.userImageSrc,
      experienceLevel: r.author.experienceLevel,
      isVerified: r.author.isVerified,
    },
    community: {
      id: r.community.id,
      slug: r.community.slug,
      name: r.community.name,
      color: r.community.color,
    },
  }));

  return (
    <PostList
      initialPosts={initialPosts}
      sort={sort}
      communitySlug={communitySlug}
    />
  );
}
