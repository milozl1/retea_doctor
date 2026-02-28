"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useComments(postId: number, sort = "best") {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/comments?postId=${postId}&sort=${sort}`,
    fetcher
  );

  return {
    comments: data?.comments ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
