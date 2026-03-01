import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

interface PostData {
  post: {
    id: number;
    title: string;
    content: string;
    type: string;
    score: number;
    commentCount: number;
    viewCount: number;
    createdAt: string;
    tags: string[];
    isPinned: boolean;
  };
  author: {
    userId: string;
    userName: string;
    userImageSrc: string;
    experienceLevel: string;
    isVerified: boolean;
  };
  community: {
    id: number;
    slug: string;
    name: string;
    color: string;
  };
  userVote?: "upvote" | "downvote" | null;
}

export function usePosts({
  sort = "hot",
  communitySlug,
}: {
  sort?: string;
  communitySlug?: string;
}) {
  const getKey = (pageIndex: number, previousPageData: PostData[] | null) => {
    if (previousPageData && previousPageData.length === 0) return null;
    const params = new URLSearchParams({ sort, page: String(pageIndex) });
    if (communitySlug) params.set("community", communitySlug);
    if (pageIndex > 0 && previousPageData) {
      const lastPost = previousPageData[previousPageData.length - 1];
      if (lastPost) params.set("cursor", String(lastPost.post.id));
    }
    return `/api/posts?${params.toString()}`;
  };

  const result = useSWRInfinite<PostData[]>(getKey, {
    revalidateFirstPage: false,
  });

  const posts = result.data ? result.data.flat() : [];
  const isLoadingMore =
    result.isLoading ||
    (result.size > 0 &&
      result.data &&
      typeof result.data[result.size - 1] === "undefined");
  const isEmpty = result.data?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty ||
    (result.data && (result.data[result.data.length - 1]?.length ?? 0) < 20);

  return {
    ...result,
    posts,
    isLoadingMore,
    isEmpty,
    isReachingEnd,
  };
}

export function usePost(id: number | null) {
  return useSWR(id ? `/api/posts/${id}` : null);
}
