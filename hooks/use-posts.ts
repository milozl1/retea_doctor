"use client";

import useSWRInfinite from "swr/infinite";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UsePostsOptions {
  sort?: "hot" | "new" | "top";
  communityId?: number;
  limit?: number;
}

export function usePosts({
  sort = "hot",
  communityId,
  limit = 20,
}: UsePostsOptions = {}) {
  const getKey = (pageIndex: number) => {
    const params = new URLSearchParams({
      sort,
      page: String(pageIndex + 1),
      limit: String(limit),
    });
    if (communityId) params.set("communityId", String(communityId));
    return `/api/posts?${params}`;
  };

  const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    { revalidateFirstPage: false }
  );

  const posts = data?.flatMap((page) => page.posts) ?? [];
  const hasMore = data?.[data.length - 1]?.hasMore ?? false;

  return {
    posts,
    isLoading,
    isError: !!error,
    hasMore,
    loadMore: () => setSize(size + 1),
    mutate,
  };
}
