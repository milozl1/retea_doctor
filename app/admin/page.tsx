import { db } from "@/db/drizzle";
import { networkUsers, posts, comments, reports } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import Link from "next/link";
import {
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Activity,
} from "lucide-react";

export default async function AdminDashboard() {
  const [
    [usersCount],
    [postsCount],
    [commentsCount],
    [pendingReportsCount],
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(networkUsers),
    db.select({ count: sql<number>`count(*)::int` }).from(posts),
    db.select({ count: sql<number>`count(*)::int` }).from(comments),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(reports)
      .where(eq(reports.status, "pending")),
  ]);

  const recentPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      score: posts.score,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(5);

  const topUsers = await db
    .select({
      userName: networkUsers.userName,
      karma: networkUsers.karma,
      postCount: networkUsers.postCount,
      role: networkUsers.role,
    })
    .from(networkUsers)
    .orderBy(desc(networkUsers.karma))
    .limit(5);

  const stats = [
    { label: "Utilizatori", value: usersCount?.count ?? 0, icon: Users, color: "#2196F3", href: "/admin/users" },
    { label: "Postări", value: postsCount?.count ?? 0, icon: FileText, color: "#4CAF50", href: "/admin" },
    { label: "Comentarii", value: commentsCount?.count ?? 0, icon: MessageSquare, color: "#FFC107", href: "/admin" },
    { label: "Rapoarte Pendinte", value: pendingReportsCount?.count ?? 0, icon: AlertTriangle, color: "#F44336", href: "/admin/reports" },
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Statistici și activitate recentă</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href} className="glass-card p-5 hover:bg-white/[0.04] transition-colors group">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                <TrendingUp className="h-3 w-3 text-slate-700 group-hover:text-slate-500 transition-colors" />
              </div>
              <p className="text-3xl font-bold text-white tabular-nums">{stat.value}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">{stat.label}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Posts */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-white/[0.04] flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-white">Postări recente</h2>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {recentPosts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm text-slate-300 truncate flex-1 mr-4">{post.title}</span>
                  <span className="text-xs text-slate-600 tabular-nums shrink-0">↑ {post.score}</span>
                </Link>
              ))}
              {recentPosts.length === 0 && (
                <p className="px-4 py-6 text-sm text-slate-600 text-center">Nicio postare încă.</p>
              )}
            </div>
          </div>

          {/* Top Users */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-white/[0.04] flex items-center gap-2">
              <Users className="h-4 w-4 text-clinical" />
              <h2 className="text-sm font-semibold text-white">Top utilizatori</h2>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {topUsers.map((u, i) => (
                <div key={u.userName} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xs text-slate-700 font-bold font-mono w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-300">{u.userName}</span>
                    {u.role === "admin" && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">admin</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 tabular-nums">⭐ {u.karma}</span>
                  <span className="text-xs text-slate-600 tabular-nums">{u.postCount} postări</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
