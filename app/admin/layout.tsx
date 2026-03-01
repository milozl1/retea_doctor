import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { networkUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  BarChart3,
  Users,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Shield,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/reports", label: "Rapoarte", icon: AlertTriangle },
  { href: "/admin/users", label: "Utilizatori", icon: Users },
  { href: "/admin/communities", label: "Comunități", icon: FileText },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
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

  return (
    <div className="min-h-screen bg-[#040711]">
      {/* Admin Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#060a14]/90 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="flex h-full items-center px-6 gap-6">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Rețea</span>
          </Link>

          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-red-400" />
            <span className="text-sm font-semibold text-white">Admin Panel</span>
          </div>

          <nav className="flex items-center gap-1 ml-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="pt-14">
        {children}
      </main>
    </div>
  );
}
