import { requireAuth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { networkUsers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import { Shield, Star, User } from "lucide-react";

export default async function AdminUsersPage() {
  const { userId } = await requireAuth();

  const [user] = await db
    .select()
    .from(networkUsers)
    .where(eq(networkUsers.userId, userId))
    .limit(1);

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  const allUsers = await db
    .select()
    .from(networkUsers)
    .orderBy(desc(networkUsers.karma))
    .limit(100);

  const roleIcons = {
    admin: Shield,
    moderator: Star,
    user: User,
  };

  const roleColors = {
    admin: "bg-red-500/20 text-red-400",
    moderator: "bg-purple-500/20 text-purple-400",
    user: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">
            👥 Utilizatori
          </h1>
          <Link href="/admin" className="text-blue-400 hover:underline text-sm">
            ← Panou admin
          </Link>
        </div>

        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-sm text-gray-400 font-medium">
                    Utilizator
                  </th>
                  <th className="text-left px-4 py-3 text-sm text-gray-400 font-medium">
                    Rol
                  </th>
                  <th className="text-right px-4 py-3 text-sm text-gray-400 font-medium">
                    Karma
                  </th>
                  <th className="text-right px-4 py-3 text-sm text-gray-400 font-medium">
                    Postări
                  </th>
                  <th className="text-right px-4 py-3 text-sm text-gray-400 font-medium">
                    Înregistrat
                  </th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => {
                  const RoleIcon = roleIcons[u.role as keyof typeof roleIcons] || User;
                  return (
                    <tr
                      key={u.userId}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/u/${u.userId}`}
                          className="flex items-center gap-2"
                        >
                          <img
                            src={u.userImageSrc}
                            alt={u.userName}
                            className="h-8 w-8 rounded-full"
                          />
                          <div>
                            <span className="text-sm text-white font-medium">
                              {u.userName}
                            </span>
                            {u.isVerified && (
                              <span className="ml-1 text-blue-400">✓</span>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={roleColors[u.role as keyof typeof roleColors]}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-white">
                        {u.karma}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-400">
                        {u.postCount}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-500">
                        {timeAgo(u.joinedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
