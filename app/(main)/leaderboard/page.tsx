import { db } from "@/db/drizzle";
import { networkUsers } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatNumber, EXPERIENCE_LABELS } from "@/lib/utils";
import { Trophy, Medal, Award, Star, FileText, MessageSquare } from "lucide-react";

export default async function LeaderboardPage() {
  const topUsers = await db
    .select()
    .from(networkUsers)
    .orderBy(desc(networkUsers.karma))
    .limit(50);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-400" />;
    if (index === 1) return <Medal className="h-5 w-5 text-slate-300" />;
    if (index === 2) return <Award className="h-5 w-5 text-amber-600" />;
    return (
      <span className="text-sm font-mono text-slate-600 w-5 text-center">
        {index + 1}
      </span>
    );
  };

  const getRankBg = (index: number) => {
    if (index === 0) return "bg-yellow-500/[0.06] border-yellow-500/20";
    if (index === 1) return "bg-slate-400/[0.04] border-slate-400/15";
    if (index === 2) return "bg-amber-600/[0.04] border-amber-600/15";
    return "";
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Clasament</h1>
            <p className="text-slate-400 text-sm">
              Top contribuitori din comunitatea medicală
            </p>
          </div>
        </div>
      </div>

      {/* Top 3 podium */}
      {topUsers.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[1, 0, 2].map((idx) => {
            const user = topUsers[idx];
            if (!user) return null;
            return (
              <Link
                key={user.userId}
                href={`/u/${user.userId}`}
                className={`glass-card p-4 text-center glass-hover ${
                  idx === 0 ? "ring-1 ring-yellow-500/20 -mt-2" : ""
                }`}
              >
                <div className="flex justify-center mb-2">
                  {getRankIcon(idx)}
                </div>
                <Avatar className={`mx-auto mb-2 ${idx === 0 ? "h-16 w-16" : "h-12 w-12"}`}>
                  <AvatarImage src={user.userImageSrc} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {user.userName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium text-white truncate">
                  {user.userName}
                </p>
                {user.specialization && (
                  <p className="text-[10px] text-slate-500 truncate">
                    {user.specialization}
                  </p>
                )}
                <p className="text-lg font-bold text-primary mt-1">
                  {formatNumber(user.karma)}
                </p>
                <p className="text-[10px] text-slate-600">karma</p>
              </Link>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-white/[0.04]">
          {topUsers.map((user, index) => (
            <Link
              key={user.userId}
              href={`/u/${user.userId}`}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors ${getRankBg(index)}`}
            >
              <div className="w-8 flex justify-center shrink-0">
                {getRankIcon(index)}
              </div>
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={user.userImageSrc} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {user.userName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white truncate">
                    {user.userName}
                  </span>
                  {user.isVerified && (
                    <span className="text-primary text-xs">✓</span>
                  )}
                  <Badge
                    variant="outline"
                    className="text-[10px] border-white/10 text-slate-500 hidden sm:inline-flex"
                  >
                    {EXPERIENCE_LABELS[user.experienceLevel] || user.experienceLevel}
                  </Badge>
                </div>
                {user.specialization && (
                  <p className="text-xs text-slate-500 truncate">
                    {user.specialization}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <FileText className="h-3 w-3" />
                  {user.postCount}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <MessageSquare className="h-3 w-3" />
                  {user.commentCount}
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold text-primary tabular-nums min-w-[4rem] justify-end">
                  <Star className="h-3.5 w-3.5" />
                  {formatNumber(user.karma)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
