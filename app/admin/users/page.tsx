import { db } from "@/db/drizzle";
import { networkUsers } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import { Shield, Star, User } from "lucide-react";
import { RoleSelector } from "@/components/admin/role-selector";

export default async function AdminUsersPage() {
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
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-xl font-bold text-white">Utilizatori</h1>

        <div className="glass-card overflow-hidden">
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
                        <RoleSelector
                          userId={u.userId}
                          currentRole={u.role}
                          roleColors={roleColors}
                        />
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
