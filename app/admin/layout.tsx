import { requireAuth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { networkUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";

async function requireAdmin(userId: string) {
  const [user] = await db
    .select({ role: networkUsers.role })
    .from(networkUsers)
    .where(eq(networkUsers.userId, userId))
    .limit(1);

  if (!user || user.role !== "admin") {
    redirect("/");
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  await requireAdmin(user.id);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-white font-bold">
            🏥 MedRețea
          </Link>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400 text-sm">Admin</span>
          <div className="flex gap-4 ml-auto">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-white text-sm">
              Dashboard
            </Link>
            <Link href="/admin/dashboard/reports" className="text-slate-400 hover:text-white text-sm">
              Rapoarte
            </Link>
            <Link href="/admin/dashboard/users" className="text-slate-400 hover:text-white text-sm">
              Utilizatori
            </Link>
            <Link href="/admin/dashboard/communities" className="text-slate-400 hover:text-white text-sm">
              Comunități
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
