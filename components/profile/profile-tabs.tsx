"use client";

import { useState } from "react";
import { PostCard } from "@/components/feed/post-card";
import { FileText, MessageSquare, Bookmark, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "posts" | "comments" | "saved";

interface Post {
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
}

interface Comment {
  id: number;
  content: string;
  score: number;
  createdAt: string | Date;
  postId: number;
}

interface ProfileTabsProps {
  userId: string;
  userName: string;
  userImageSrc: string;
  karma: number;
  isVerified: boolean;
  posts: Post[];
  comments?: Comment[];
  savedPosts?: Post[];
}

const TABS = [
  { value: "posts" as Tab, label: "Postări", icon: FileText },
  { value: "comments" as Tab, label: "Comentarii", icon: MessageSquare },
  { value: "saved" as Tab, label: "Salvate", icon: Bookmark },
];

export function ProfileTabs({
  userId,
  userName,
  userImageSrc,
  karma,
  isVerified,
  posts,
  comments = [],
  savedPosts = [],
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("posts");

  const counts: Record<Tab, number> = {
    posts: posts.length,
    comments: comments.length,
    saved: savedPosts.length,
  };

  return (
    <div className="space-y-4">
      {/* Tab header */}
      <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setActiveTab(value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center",
              activeTab === value
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/10"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            {counts[value] > 0 && (
              <span
                className={cn(
                  "text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center",
                  activeTab === value
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-slate-400"
                )}
              >
                {counts[value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-3">
        {activeTab === "posts" && (
          <>
            {posts.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-8 w-8 opacity-30" />}
                message="Nicio postare încă"
              />
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  author={{ userId, userName, userImageSrc, karma, isVerified }}
                  community={null}
                />
              ))
            )}
          </>
        )}

        {activeTab === "comments" && (
          <>
            {comments.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="h-8 w-8 opacity-30" />}
                message="Niciun comentariu încă"
              />
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUp className="h-3.5 w-3.5 text-orange-400" />
                    <span className="text-sm font-medium text-orange-400">
                      {comment.score}
                    </span>
                    <span className="text-xs text-slate-500">
                      în postarea #{comment.postId}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm line-clamp-3">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === "saved" && (
          <>
            {savedPosts.length === 0 ? (
              <EmptyState
                icon={<Bookmark className="h-8 w-8 opacity-30" />}
                message="Nicio postare salvată"
              />
            ) : (
              savedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  author={{ userId, userName, userImageSrc, karma, isVerified }}
                  community={null}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) {
  return (
    <div className="text-center py-12 text-slate-400 bg-white/5 border border-white/10 rounded-xl">
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="text-sm">{message}</p>
    </div>
  );
}
