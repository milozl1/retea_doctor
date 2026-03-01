import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ReportModal } from "@/components/modals/report-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { authWithUser } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { networkUsers } from "@/db/schema";

/**
 * Ensure the current Supabase Auth user exists in network_users.
 * Uses INSERT … ON CONFLICT DO UPDATE so it is a single query:
 *   - First visit  → inserts a new row (creates the network profile)
 *   - Return visit → updates name/avatar/lastSeen (keeps in sync with Doctor)
 *
 * This is the glue that makes one Supabase account work across both apps.
 */
async function ensureUserSynced() {
  try {
    const { userId, user } = await authWithUser();
    if (!userId || !user) return;

    await db
      .insert(networkUsers)
      .values({
        userId,
        userName: user.firstName,
        userImageSrc: user.imageUrl,
        experienceLevel: "student",
      })
      .onConflictDoUpdate({
        target: networkUsers.userId,
        set: {
          userName: user.firstName,
          userImageSrc: user.imageUrl,
          lastSeenAt: new Date(),
        },
      });
  } catch {
    // Non-fatal: the page still renders even if the sync fails
  }
}

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureUserSynced();

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6 pb-20 lg:pb-6">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>

          {/* Right Sidebar */}
          <div className="hidden xl:block">
            <RightSidebar />
          </div>
        </div>
      </div>
      {/* Mobile navigation */}
      <MobileNav />
      {/* Modals */}
      <ReportModal />
      <DeleteConfirmModal />
    </div>
  );
}

