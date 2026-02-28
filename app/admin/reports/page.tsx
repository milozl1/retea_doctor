import { requireAuth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { networkUsers, reports, posts } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const { userId } = await requireAuth();

  const [user] = await db
    .select()
    .from(networkUsers)
    .where(eq(networkUsers.userId, userId))
    .limit(1);

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  const status = searchParams.status || "pending";

  const allReports = await db
    .select({
      report: reports,
      reporter: {
        userId: networkUsers.userId,
        userName: networkUsers.userName,
      },
    })
    .from(reports)
    .innerJoin(networkUsers, eq(reports.reporterId, networkUsers.userId))
    .where(eq(reports.status, status as any))
    .orderBy(desc(reports.createdAt))
    .limit(50);

  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-400",
    reviewed: "bg-blue-500/20 text-blue-400",
    resolved: "bg-green-500/20 text-green-400",
    dismissed: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">
            ⚠️ Rapoarte
          </h1>
          <Link href="/admin" className="text-blue-400 hover:underline text-sm">
            ← Panou admin
          </Link>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 mb-6">
          {["pending", "reviewed", "resolved", "dismissed"].map((s) => (
            <Link
              key={s}
              href={`/admin/reports?status=${s}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                status === s
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {s === "pending"
                ? "Pendinte"
                : s === "reviewed"
                  ? "Verificate"
                  : s === "resolved"
                    ? "Rezolvate"
                    : "Respinse"}
            </Link>
          ))}
        </div>

        {allReports.length > 0 ? (
          <div className="space-y-3">
            {allReports.map(({ report, reporter }) => (
              <div key={report.id} className="glass p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-white">
                        {report.reason}
                      </span>
                      <Badge
                        className={statusColors[report.status as keyof typeof statusColors]}
                      >
                        {report.status}
                      </Badge>
                    </div>
                    {report.details && (
                      <p className="text-sm text-gray-400 mt-1">
                        {report.details}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>
                        Raportat de {reporter.userName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(report.createdAt)}
                      </span>
                      {report.postId && (
                        <Link
                          href={`/post/${report.postId}`}
                          className="text-blue-400 hover:underline"
                        >
                          Vezi postarea →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-400">
              Niciun raport {status === "pending" ? "pendinte" : ""}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
