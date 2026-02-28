import { db } from "@/db/drizzle";
import { posts, comments, networkUsers, reports } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

async function getStats() {
  try {
    const [postCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(eq(posts.isDeleted, false));

    const [commentCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .where(eq(comments.isDeleted, false));

    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(networkUsers);

    const [pendingReports] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(eq(reports.status, "pending"));

    return {
      posts: postCount?.count ?? 0,
      comments: commentCount?.count ?? 0,
      users: userCount?.count ?? 0,
      pendingReports: pendingReports?.count ?? 0,
    };
  } catch {
    return { posts: 0, comments: 0, users: 0, pendingReports: 0 };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const statCards = [
    { label: "Postări", value: stats.posts, icon: "📝", color: "blue" },
    { label: "Comentarii", value: stats.comments, icon: "💬", color: "green" },
    { label: "Utilizatori", value: stats.users, icon: "👥", color: "purple" },
    { label: "Rapoarte în așteptare", value: stats.pendingReports, icon: "⚠️", color: "red" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon }) => (
          <div
            key={label}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-slate-400">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
