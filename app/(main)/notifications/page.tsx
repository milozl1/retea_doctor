import { requireAuth } from "@/lib/auth";
import { getNotifications, getUnreadNotificationCount } from "@/db/queries";
import { NotificationsClient } from "./notifications-client";

export default async function NotificationsPage() {
  const { userId } = await requireAuth();

  const [items, unreadCount] = await Promise.all([
    getNotifications(userId, 50),
    getUnreadNotificationCount(userId),
  ]);

  return <NotificationsClient initialNotifications={items} initialUnreadCount={unreadCount} />;
}
