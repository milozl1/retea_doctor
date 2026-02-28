import { Suspense } from "react";
import { PostListServer } from "@/components/feed/post-list-server";
import { FeedSortTabs } from "@/components/feed/feed-sort-tabs";

export default function HomePage({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const sort = (searchParams.sort as "hot" | "new" | "top") || "hot";

  return (
    <div className="space-y-4">
      {/* Welcome banner */}
      <div className="relative overflow-hidden glass-card p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.06] rounded-full blur-[60px] -mr-10 -mt-10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-lg">🩺</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Rețea Medicală
              </h1>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">
                Comunitate profesională
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mt-3">
            Discuții între profesioniști, cazuri clinice, evidențe și comunitate.
          </p>
        </div>
      </div>

      {/* Sort Tabs */}
      <FeedSortTabs />

      {/* Post List */}
      <Suspense
        fallback={
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-5">
                <div className="flex gap-3">
                  <div className="w-10 h-20 bg-white/[0.03] rounded-lg animate-shimmer" />
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                      <div className="h-4 bg-white/[0.04] rounded-md w-16 animate-shimmer" />
                      <div className="h-4 bg-white/[0.03] rounded-md w-24 animate-shimmer" />
                    </div>
                    <div className="h-5 bg-white/[0.05] rounded-md w-4/5 animate-shimmer" />
                    <div className="h-3 bg-white/[0.03] rounded-md w-full animate-shimmer" />
                    <div className="h-3 bg-white/[0.02] rounded-md w-2/3 animate-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      >
        <PostListServer sort={sort} />
      </Suspense>
    </div>
  );
}
