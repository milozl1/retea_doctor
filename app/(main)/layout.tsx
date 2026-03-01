import { HeaderServer } from "@/components/layout/header-server";
import { SidebarServer } from "@/components/layout/sidebar-server";
import { RightSidebarServer } from "@/components/layout/right-sidebar-server";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ReportModal } from "@/components/modals/report-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { authWithUser } from "@/lib/auth";
import { getOrCreateNetworkUser } from "@/db/queries";

/**
 * Auto-sync: ensure the Supabase Auth user has a row in network_users.
 *
 * Uses the shared `getOrCreateNetworkUser` from db/queries so that a user
 * who registers on MedLearn and visits MedRețea for the first time gets a
 * network profile automatically — no separate registration step.
 *
 * This is the glue that makes one Supabase account work across both apps.
 */
async function ensureUserSynced() {
  try {
    const { userId, user } = await authWithUser();
    if (!userId || !user) return;
    await getOrCreateNetworkUser({
      userId,
      userName: user.firstName,
      userImageSrc: user.imageUrl,
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
  const { userId } = await authWithUser();
  await ensureUserSynced();

  return (
    <div className="min-h-screen bg-[#040711]">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/[0.02] rounded-full blur-[120px]" />
      </div>

      <HeaderServer />
      <div className="relative flex pt-16">
        {/* Left Sidebar */}
        <aside className="hidden lg:block fixed left-0 top-16 w-[260px] h-[calc(100vh-4rem)] overflow-y-auto scrollbar-thin border-r border-white/[0.04] bg-[#060a14]/60 backdrop-blur-sm">
          <SidebarServer />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-[260px] xl:mr-[320px] min-h-[calc(100vh-4rem)]">
          <div className="max-w-2xl mx-auto px-4 py-5 pb-24 lg:pb-5">
            {children}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden xl:block fixed right-0 top-16 w-[320px] h-[calc(100vh-4rem)] overflow-y-auto scrollbar-thin border-l border-white/[0.04] bg-[#060a14]/40 backdrop-blur-sm p-4">
          <RightSidebarServer />
        </aside>
      </div>

      {/* Mobile Navigation */}
      <MobileNav userId={userId} />

      {/* Global Modals */}
      <ReportModal />
      <DeleteConfirmModal />
    </div>
  );
}

