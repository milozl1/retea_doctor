import { requireAuth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { notifications, networkUsers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NotificationList } from "@/components/notifications/notification-list";
import { Bell } from "lucide-react";

export const metadata = {
  title: "Notificări — MedRețea",
};

async function getNotifications(userId: string) {
  try {
    return await db
      .select({
        notification: notifications,
        actor: {
          userId: networkUsers.userId,
          userName: networkUsers.userName,
          userImageSrc: networkUsers.userImageSrc,
        },
      })
      .from(notifications)
      .leftJoin(networkUsers, eq(notifications.actorId, networkUsers.userId))
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  } catch {
    return [];
  }
}

export default async function NotificationsPage() {
  const user = await requireAuth();
  const notifs = await getNotifications(user.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6 text-blue-400" />
        <h1 className="text-2xl font-bold text-white">Notificări</h1>
      </div>
      <NotificationList initialNotifications={notifs} />
    </div>
  );
}
