import Link from "next/link";
import { TrendingUp, ExternalLink } from "lucide-react";
import { db } from "@/db/drizzle";
import { posts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

async function getTrendingPosts() {
  try {
    return await db
      .select({ id: posts.id, title: posts.title, score: posts.score })
      .from(posts)
      .where(eq(posts.isDeleted, false))
      .orderBy(desc(posts.score))
      .limit(5);
  } catch {
    return [];
  }
}

export async function RightSidebar() {
  const trending = await getTrendingPosts();

  return (
    <aside className="w-72 flex-shrink-0">
      <div className="sticky top-20 space-y-4">
        {/* Trending */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-400" />
            Trending
          </h3>
          {trending.length > 0 ? (
            <div className="space-y-2">
              {trending.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="flex items-start gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <span className="text-slate-600 font-mono text-xs mt-0.5">
                    {i + 1}.
                  </span>
                  <span className="line-clamp-2">{post.title}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-xs">Nicio postare încă</p>
          )}
        </div>

        {/* MedLearn Link */}
        <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-2">
            🎓 MedLearn
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Continuă-ți pregătirea pe platforma MedLearn
          </p>
          <Link
            href={process.env.NEXT_PUBLIC_MEDLEARN_URL ?? "http://localhost:3000"}
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Mergi la MedLearn
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
