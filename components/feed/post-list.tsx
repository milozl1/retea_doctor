"use client";

import { useEffect, useRef } from "react";
import { PostCard } from "./post-card";
import { usePosts } from "@/hooks/use-posts";
import { Loader2 } from "lucide-react";

interface PostListProps {
  sort?: "hot" | "new" | "top";
  communityId?: number;
}

export function PostList({ sort = "hot", communityId }: PostListProps) {
  const { posts, isLoading, hasMore, loadMore } = usePosts({ sort, communityId });
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  if (isLoading && posts.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse h-32"
          />
        ))}
      </div>
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-lg font-medium">Nicio postare încă</p>
        <p className="text-sm mt-1">Fii primul care postează!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((item: {
        post: {
          id: number;
          title: string;
          content: string;
          type: string;
          linkUrl: string | null;
          tags: string[];
          upvotes: number;
          downvotes: number;
          score: number;
          commentCount: number;
          viewCount: number;
          isPinned: boolean;
          createdAt: string | Date;
        };
        author: {
          userId: string;
          userName: string;
          userImageSrc: string;
          karma?: number;
          isVerified?: boolean;
        } | null;
        community: {
          id: number;
          slug: string;
          name: string;
          color: string;
        } | null;
      }) => (
        <PostCard
          key={item.post.id}
          post={item.post}
          author={item.author}
          community={item.community}
        />
      ))}
      <div ref={observerRef} className="h-4" />
      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      )}
    </div>
  );
}
