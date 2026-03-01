import { db } from "@/db/drizzle";
import { posts, networkUsers, communities } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import Link from "next/link";
import { FileText, Eye, MessageSquare, ArrowBigUp, Pin, Lock, Trash2 } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { AdminPostActions } from "@/components/admin/post-actions";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: { page?: string; filter?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const filter = searchParams.filter || "all";
  const perPage = 25;
  const offset = (page - 1) * perPage;

  const conditions = [];
  if (filter === "deleted") {
    conditions.push(eq(posts.isDeleted, true));
  } else if (filter === "pinned") {
    conditions.push(eq(posts.isPinned, true));
  } else if (filter === "locked") {
    conditions.push(eq(posts.isLocked, true));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [allPosts, [countResult]] = await Promise.all([
    db
      .select({
        post: posts,
        authorName: networkUsers.userName,
        communityName: communities.name,
        communitySlug: communities.slug,
      })
      .from(posts)
      .innerJoin(networkUsers, eq(posts.userId, networkUsers.userId))
      .innerJoin(communities, eq(posts.communityId, communities.id))
      .where(whereClause)
      .orderBy(desc(posts.createdAt))
      .limit(perPage)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(posts)
      .where(whereClause),
  ]);

  const totalCount = countResult?.count ?? 0;
  const totalPages = Math.ceil(totalCount / perPage);

  const FILTERS = [
    { value: "all", label: "Toate" },
    { value: "pinned", label: "Fixate" },
    { value: "locked", label: "Blocate" },
    { value: "deleted", label: "Șterse" },
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Postări</h1>
            <p className="text-slate-500 text-sm mt-1">
              {totalCount} postări {filter !== "all" ? `(${FILTERS.find(f => f.value === filter)?.label})` : "total"}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 glass-card p-1 w-fit">
          {FILTERS.map((f) => (
            <Link
              key={f.value}
              href={`/admin/posts?filter=${f.value}`}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                filter === f.value
                  ? "bg-white/[0.08] text-white font-medium"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* Posts Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-3 text-slate-400 font-medium">Titlu</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Autor</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Comunitate</th>
                  <th className="text-center p-3 text-slate-400 font-medium">Scor</th>
                  <th className="text-center p-3 text-slate-400 font-medium">Com.</th>
                  <th className="text-center p-3 text-slate-400 font-medium">Vizualizări</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Dată</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Status</th>
                  <th className="text-right p-3 text-slate-400 font-medium">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {allPosts.map(({ post, authorName, communityName, communitySlug }) => (
                  <tr
                    key={post.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      post.isDeleted ? "opacity-50" : ""
                    }`}
                  >
                    <td className="p-3 max-w-[250px]">
                      <Link
                        href={`/post/${post.id}`}
                        className="text-slate-300 hover:text-white transition-colors truncate block"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="p-3 text-slate-400">{authorName}</td>
                    <td className="p-3">
                      <Link
                        href={`/c/${communitySlug}`}
                        className="text-primary/70 hover:text-primary text-xs"
                      >
                        c/{communityName}
                      </Link>
                    </td>
                    <td className="p-3 text-center">
                      <span className="flex items-center justify-center gap-1 text-slate-400">
                        <ArrowBigUp className="h-3 w-3" />
                        {post.score}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="flex items-center justify-center gap-1 text-slate-400">
                        <MessageSquare className="h-3 w-3" />
                        {post.commentCount}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="flex items-center justify-center gap-1 text-slate-500">
                        <Eye className="h-3 w-3" />
                        {post.viewCount}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-xs whitespace-nowrap">
                      {timeAgo(post.createdAt)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {post.isPinned && (
                          <span className="text-amber-400" title="Fixat">
                            <Pin className="h-3 w-3" />
                          </span>
                        )}
                        {post.isLocked && (
                          <span className="text-red-400" title="Blocat">
                            <Lock className="h-3 w-3" />
                          </span>
                        )}
                        {post.isDeleted && (
                          <span className="text-red-500" title="Șters">
                            <Trash2 className="h-3 w-3" />
                          </span>
                        )}
                        {!post.isPinned && !post.isLocked && !post.isDeleted && (
                          <span className="text-emerald-400 text-xs">Activ</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <AdminPostActions
                        postId={post.id}
                        isPinned={post.isPinned}
                        isLocked={post.isLocked}
                        isDeleted={post.isDeleted}
                      />
                    </td>
                  </tr>
                ))}
                {allPosts.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-600">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      Nicio postare găsită.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/admin/posts?page=${page - 1}&filter=${filter}`}
                className="px-3 py-1.5 rounded-lg glass-sm text-sm text-slate-400 hover:text-white"
              >
                ← Anterior
              </Link>
            )}
            <span className="text-sm text-slate-500">
              Pagina {page} din {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/admin/posts?page=${page + 1}&filter=${filter}`}
                className="px-3 py-1.5 rounded-lg glass-sm text-sm text-slate-400 hover:text-white"
              >
                Următor →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
