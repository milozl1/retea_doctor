import Link from "next/link";
import { TrendingUp, ExternalLink, GraduationCap } from "lucide-react";
import { db } from "@/db/drizzle";
import { posts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

async function getTrendingPosts() {
  return db
    .select({
      id: posts.id,
      title: posts.title,
      score: posts.score,
    })
    .from(posts)
    .where(eq(posts.isDeleted, false))
    .orderBy(desc(posts.hotScore), desc(posts.createdAt))
    .limit(5);
}

interface RightSidebarServerProps {
  communitySlug?: string;
  communityName?: string;
  communityDescription?: string;
  communityRules?: string;
  communityMemberCount?: number;
  communityPostCount?: number;
}

export async function RightSidebarServer({
  communitySlug,
  communityName,
  communityDescription,
  communityRules,
  communityMemberCount,
  communityPostCount,
}: RightSidebarServerProps) {
  const trending = await getTrendingPosts();

  return (
    <RightSidebarContent
      trending={trending}
      communitySlug={communitySlug}
      communityName={communityName}
      communityDescription={communityDescription}
      communityRules={communityRules}
      communityMemberCount={communityMemberCount}
      communityPostCount={communityPostCount}
    />
  );
}

function RightSidebarContent({
  trending,
  communitySlug,
  communityName,
  communityDescription,
  communityRules,
  communityMemberCount,
  communityPostCount,
}: RightSidebarServerProps & {
  trending: { id: number; title: string; score: number }[];
}) {
  return (
    <div className="space-y-4">
      {/* Community info if on community page */}
      {communitySlug && (
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
            Despre c/{communityName}
          </h3>
          {communityDescription && (
            <p className="text-sm text-slate-400 leading-relaxed">{communityDescription}</p>
          )}
          <div className="flex gap-6">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tabular-nums">
                {communityMemberCount ?? 0}
              </span>
              <span className="text-[11px] text-slate-600 font-medium uppercase tracking-wider">Membri</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tabular-nums">
                {communityPostCount ?? 0}
              </span>
              <span className="text-[11px] text-slate-600 font-medium uppercase tracking-wider">Postări</span>
            </div>
          </div>
          {communityRules && (
            <div className="pt-2 border-t border-white/[0.04]">
              <h4 className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.12em] mb-2">
                Reguli
              </h4>
              <div className="text-sm text-slate-400 space-y-1 whitespace-pre-line leading-relaxed">
                {communityRules}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trending */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/[0.1] flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5 text-orange-400" />
          </div>
          <h3 className="font-semibold text-white text-sm">Trending</h3>
        </div>
        <div className="px-2 pb-2">
          {trending.length > 0 ? (
            trending.map((item, i) => (
              <Link
                key={item.id}
                href={`/post/${item.id}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group"
              >
                <span className="text-[11px] text-slate-700 font-bold font-mono w-4">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors flex-1 truncate">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-600 font-medium tabular-nums">
                  {item.score} ↑
                </span>
              </Link>
            ))
          ) : (
            <p className="px-3 py-4 text-xs text-slate-600 text-center">
              Nicio postare încă.
            </p>
          )}
        </div>
      </div>

      {/* MedLearn Card */}
      <div className="glass-card p-5 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.04] rounded-full blur-[40px] -mr-8 -mt-8" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/[0.1] flex items-center justify-center">
              <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white text-sm">MedLearn</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Continuă să înveți pe platforma principală MedLearn cu cursuri interactive și quiz-uri.
          </p>
          <Link
            href={process.env.NEXT_PUBLIC_MEDLEARN_URL || "http://localhost:3000"}
            target="_blank"
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Deschide MedLearn
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 pt-2 space-y-1">
        <p className="text-[11px] text-slate-700">
          © 2026 Rețea Medicală
        </p>
        <p className="text-[11px] text-slate-700">
          Parte din ecosistemul{" "}
          <span className="text-primary/50">MedLearn</span>
        </p>
      </div>
    </div>
  );
}
