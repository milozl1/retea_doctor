"use client";

import { useNotifications } from "@/hooks/use-notifications";
import { NotificationList } from "@/components/notifications/notification-list";
import { Button } from "@/components/ui/button";
import { BellOff, CheckCheck } from "lucide-react";

interface NotificationsClientProps {
  initialNotifications: any[];
  initialUnreadCount: number;
}

export function NotificationsClient({
  initialNotifications,
  initialUnreadCount,
}: NotificationsClientProps) {
  const { notifications, count, markAsRead, markAllAsRead } = useNotifications();

  const items = notifications.length > 0 ? notifications : initialNotifications;
  const unreadCount = count || initialUnreadCount;

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
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-primary hover:text-primary/80 text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Marchează toate ca citite
            </Button>
          )}
        </div>
      </div>

      {items.length > 0 ? (
        <div className="glass p-4">
          <NotificationList
            notifications={items}
            onMarkRead={markAsRead}
          />
        </div>
      ) : (
        <div className="glass p-12 text-center">
          <BellOff className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Nicio notificare încă.</p>
          <p className="text-gray-500 text-sm mt-1">
            Vei primi notificări când cineva interacționează cu postările tale.
          </p>
        </div>
      )}
    </div>
  );
}
