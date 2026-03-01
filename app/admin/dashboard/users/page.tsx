import { db } from "@/db/drizzle";
import { networkUsers } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber } from "@/lib/utils";
import { Users } from "lucide-react";

export const metadata = {
  title: "Utilizatori — Admin MedRețea",
};

async function getUsers() {
  try {
    return await db
      .select()
      .from(networkUsers)
      .orderBy(desc(networkUsers.joinedAt))
      .limit(100);
  } catch {
    return [];
  }
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500/20 text-red-400 border-red-500/30",
  moderator: "bg-green-500/20 text-green-400 border-green-500/30",
  user: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const EXP_COLORS: Record<string, string> = {
  medic: "text-green-400",
  rezident: "text-blue-400",
  student: "text-yellow-400",
};

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-400" />
          Utilizatori
        </h1>
        <span className="text-sm text-slate-400">
          {users.length} utilizatori total
        </span>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[auto,1fr,auto,auto,auto] gap-4 px-4 py-2 border-b border-white/10 text-xs text-slate-500 font-medium uppercase tracking-wider">
          <span>Avatar</span>
          <span>Utilizator</span>
          <span className="text-center">Karma</span>
          <span className="text-center">Rol</span>
          <span>Înregistrat</span>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>Niciun utilizator</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {users.map((user) => (
              <div
                key={user.userId}
                className="grid grid-cols-[auto,1fr,auto,auto,auto] gap-4 px-4 py-3 items-center hover:bg-white/5 transition-colors"
              >
                {/* Avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.userImageSrc} />
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {user.userName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Name + specialization */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/u/${user.userId}`}
                      className="text-sm font-medium text-white hover:text-blue-400 transition-colors truncate"
                    >
                      {user.userName}
                    </Link>
                    {user.isVerified && (
                      <span className="text-blue-400 text-xs">✓</span>
                    )}
                  </div>
                  {user.specialization && (
                    <p className="text-xs text-slate-500 truncate">
                      {user.specialization}
                    </p>
                  )}
                  <p
                    className={`text-xs ${EXP_COLORS[user.experienceLevel] ?? "text-slate-500"}`}
                  >
                    {user.experienceLevel}
                  </p>
                </div>

                {/* Karma */}
                <div className="text-center">
                  <span className="text-sm font-medium text-orange-400">
                    {formatNumber(user.karma)}
                  </span>
                </div>

                {/* Role */}
                <div className="text-center">
                  <Badge
                    variant="outline"
                    className={`text-xs ${ROLE_COLORS[user.role] ?? ""}`}
                  >
                    {user.role}
                  </Badge>
                </div>

                {/* Joined */}
                <div className="text-xs text-slate-500 whitespace-nowrap">
                  {formatDate(user.joinedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
