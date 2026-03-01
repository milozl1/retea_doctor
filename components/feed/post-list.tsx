"use client";

import { PostCard } from "./post-card";
import { Loader2, FileText } from "lucide-react";
import useSWRInfinite from "swr/infinite";
import { useEffect, useRef, useCallback } from "react";

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

interface PostListProps {
  initialPosts: PostData[];
  sort: string;
  communitySlug?: string;
  showCommunity?: boolean;
}

export function PostList({
  initialPosts,
  sort,
  communitySlug,
  showCommunity = true,
}: PostListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

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

  const fetcher = (url: string) =>
    fetch(url)
      .then((res) => res.json())
      .then((data) => data.posts as PostData[]);

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite<
    PostData[]
  >(getKey, fetcher, {
    fallbackData: [initialPosts],
    revalidateFirstPage: false,
  });

  const posts = data ? data.flat() : initialPosts;
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (data && (data[data.length - 1]?.length ?? 0) < 20);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoadingMore || isReachingEnd) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting) {
          setSize((prev) => prev + 1);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isLoadingMore, isReachingEnd, setSize]
  );

  if (posts.length === 0 && !isLoading) {
    return (
      <div className="glass-card p-12 text-center space-y-4">
        <FileText className="h-12 w-12 text-slate-600 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold text-white">
            Nicio postare încă
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Fii primul care postează în această comunitate!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((item, index) => (
        <div
          key={item.post.id}
          ref={index === posts.length - 1 ? lastElementRef : undefined}
        >
          <PostCard
            post={item.post}
            author={item.author}
            community={item.community}
            userVote={item.userVote}
            showCommunity={showCommunity}
          />
        </div>
      ))}

      {(isLoadingMore || isValidating) && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {isReachingEnd && posts.length > 0 && (
        <p className="text-center text-sm text-slate-600 py-4">
          Ai ajuns la final 🎉
        </p>
      )}
    </div>
  );
}
