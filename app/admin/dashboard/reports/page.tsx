import { db } from "@/db/drizzle";
import { reports, networkUsers, posts, comments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileText, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Rapoarte — Admin MedRețea",
};

async function getReports() {
  try {
    return await db
      .select({
        report: reports,
        reporter: {
          userId: networkUsers.userId,
          userName: networkUsers.userName,
        },
      })
      .from(reports)
      .leftJoin(networkUsers, eq(reports.reporterId, networkUsers.userId))
      .orderBy(desc(reports.createdAt))
      .limit(50);
  } catch {
    return [];
  }
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  reviewed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  resolved: "bg-green-500/20 text-green-400 border-green-500/30",
  dismissed: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "În așteptare",
  reviewed: "Revizuit",
  resolved: "Rezolvat",
  dismissed: "Respins",
};

export default async function AdminReportsPage() {
  const allReports = await getReports();

  const pending = allReports.filter((r) => r.report.status === "pending");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-yellow-400" />
          Rapoarte
        </h1>
        <div className="flex gap-2 text-sm">
          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-lg">
            {pending.length} în așteptare
          </span>
        </div>
      </div>

      {allReports.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white/5 border border-white/10 rounded-xl">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Niciun raport</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allReports.map(({ report, reporter }) => (
            <div
              key={report.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Status + type */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={STATUS_COLORS[report.status] ?? ""}
                    >
                      {STATUS_LABELS[report.status] ?? report.status}
                    </Badge>
                    {report.postId && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <FileText className="h-3 w-3" />
                        Postare #{report.postId}
                      </span>
                    )}
                    {report.commentId && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MessageSquare className="h-3 w-3" />
                        Comentariu #{report.commentId}
                      </span>
                    )}
                  </div>

                  {/* Reason */}
                  <p className="text-white font-medium text-sm">
                    {report.reason}
                  </p>
                  {report.details && (
                    <p className="text-slate-400 text-sm mt-1">{report.details}</p>
                  )}

                  {/* Reporter + time */}
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    {reporter && (
                      <Link
                        href={`/u/${reporter.userId}`}
                        className="hover:text-slate-300"
                      >
                        raportat de {reporter.userName}
                      </Link>
                    )}
                    <span>•</span>
                    <span>{timeAgo(report.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {report.postId && (
                    <Link
                      href={`/post/${report.postId}`}
                      className="text-xs text-blue-400 hover:text-blue-300 underline"
                      target="_blank"
                    >
                      Vezi postarea
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
