import { requireAuth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { networkUsers, posts, comments, reports, communities } from "@/db/schema";
import { eq, sql, desc, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

export default async function AdminDashboard() {
  const { userId } = await requireAuth();

  const [user] = await db
    .select()
    .from(networkUsers)
    .where(eq(networkUsers.userId, userId))
    .limit(1);

  if (!user || user.role !== "admin") {
    redirect("/");
  }

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

  const stats = [
    {
      label: "Utilizatori",
      value: usersCount?.count ?? 0,
      icon: Users,
      color: "#2196F3",
    },
    {
      label: "Postări",
      value: postsCount?.count ?? 0,
      icon: FileText,
      color: "#4CAF50",
    },
    {
      label: "Comentarii",
      value: commentsCount?.count ?? 0,
      icon: MessageSquare,
      color: "#FFC107",
    },
    {
      label: "Rapoarte Pendinte",
      value: pendingReportsCount?.count ?? 0,
      icon: AlertTriangle,
      color: "#F44336",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              🛡️ Panou Admin
            </h1>
            <p className="text-gray-400 text-sm">
              Gestionează platforma Rețea Medicală
            </p>
          </div>
          <Link href="/" className="text-blue-400 hover:underline text-sm">
            ← Înapoi la rețea
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="glass p-6">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon
                  className="h-5 w-5"
                  style={{ color: stat.color }}
                />
                <span className="text-sm text-gray-400">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/reports"
            className="glass p-6 glass-hover flex items-center gap-3"
          >
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <div>
              <h3 className="font-medium text-white">Rapoarte</h3>
              <p className="text-sm text-gray-400">
                Verifică conținut raportat
              </p>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="glass p-6 glass-hover flex items-center gap-3"
          >
            <Users className="h-6 w-6 text-blue-400" />
            <div>
              <h3 className="font-medium text-white">Utilizatori</h3>
              <p className="text-sm text-gray-400">
                Gestionează utilizatorii
              </p>
            </div>
          </Link>

          <Link
            href="/admin/communities"
            className="glass p-6 glass-hover flex items-center gap-3"
          >
            <BarChart3 className="h-6 w-6 text-green-400" />
            <div>
              <h3 className="font-medium text-white">Comunități</h3>
              <p className="text-sm text-gray-400">
                Gestionează comunitățile
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
