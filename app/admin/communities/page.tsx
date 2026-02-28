import { requireAuth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { networkUsers, communities } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";

export default async function AdminCommunitiesPage() {
  const { userId } = await requireAuth();

  const [user] = await db
    .select()
    .from(networkUsers)
    .where(eq(networkUsers.userId, userId))
    .limit(1);

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  const allCommunities = await db
    .select()
    .from(communities)
    .orderBy(desc(communities.memberCount));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">
            🏛️ Comunități
          </h1>
          <Link href="/admin" className="text-blue-400 hover:underline text-sm">
            ← Panou admin
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {allCommunities.map((community) => (
            <div key={community.id} className="glass p-4">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: community.color + "20" }}
                >
                  {community.iconSrc || "🏥"}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">
                    {community.name}
                  </h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {community.memberCount} membri
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                /{community.slug}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
