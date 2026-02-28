import { Suspense } from "react";
import { FeedSortTabs } from "@/components/feed/feed-sort-tabs";
import { PostList } from "@/components/feed/post-list";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { currentUser } from "@/lib/auth";

interface PageProps {
  searchParams: { sort?: string };
}

export default async function HomePage({ searchParams }: PageProps) {
  const user = await currentUser();
  const sort = (searchParams.sort as "hot" | "new" | "top") ?? "hot";

  return (
    <div className="space-y-4">
      {/* Welcome banner for new users */}
      {!user && (
        <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-xl p-4">
          <h2 className="text-white font-semibold mb-1">
            Bun venit pe MedRețea! 🏥
          </h2>
          <p className="text-slate-400 text-sm">
            Rețeaua de socializare profesională a medicilor din România.{" "}
            <Link href="/auth/login" className="text-blue-400 hover:underline">
              Autentifică-te
            </Link>{" "}
            pentru a posta și comenta.
          </p>
        </div>
      )}

      {/* Create post CTA */}
      {user && (
        <Link href="/post/new">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/[0.07] transition-colors cursor-pointer flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
              <PlusCircle className="h-4 w-4" />
            </div>
            <span className="text-slate-400 text-sm">Creează o postare nouă...</span>
          </div>
        </Link>
      )}

      {/* Sort tabs */}
      <FeedSortTabs currentSort={sort} />

      {/* Post list */}
      <Suspense
        fallback={
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse h-32"
              />
            ))}
          </div>
        }
      >
        <PostList sort={sort} />
      </Suspense>
    </div>
  );
}
