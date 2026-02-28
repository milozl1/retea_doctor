import { requireAuth } from "@/lib/auth";
import { getNotifications, getUnreadNotificationCount } from "@/db/queries";
import { NotificationList } from "@/components/notifications/notification-list";
import { Bell, BellOff } from "lucide-react";

export default async function NotificationsPage() {
  const { userId } = await requireAuth();

  const [items, unreadCount] = await Promise.all([
    getNotifications(userId, 50),
    getUnreadNotificationCount(userId),
  ]);

  return (
    <div className="space-y-4">
      <div className="glass p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">
              🔔 Notificări
            </h1>
            <p className="text-gray-400 text-sm">
              {unreadCount > 0
                ? `${unreadCount} notificări necitite`
                : "Nicio notificare nouă"}
            </p>
          </div>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="glass p-4">
          <NotificationList notifications={items} />
        </div>
      ) : (
        <div className="glass p-12 text-center">
          <BellOff className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">
            Nicio notificare încă.
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Vei primi notificări când cineva interacționează cu postările tale.
          </p>
        </div>
      )}
    </div>
  );
}
