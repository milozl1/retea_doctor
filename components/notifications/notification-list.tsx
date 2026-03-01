"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import { Bell, MessageSquare, ArrowUp, AtSign, Users } from "lucide-react";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/use-notifications";

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  reply_post: <MessageSquare className="h-3.5 w-3.5 text-blue-400" />,
  reply_comment: <MessageSquare className="h-3.5 w-3.5 text-green-400" />,
  upvote: <ArrowUp className="h-3.5 w-3.5 text-orange-400" />,
  mention: <AtSign className="h-3.5 w-3.5 text-purple-400" />,
  new_post_community: <Users className="h-3.5 w-3.5 text-cyan-400" />,
};

interface NotificationItemType {
  notification: {
    id: number;
    type: string;
    message: string;
    isRead: boolean;
    postId: number | null;
    commentId: number | null;
    createdAt: string | Date;
  };
  actor: {
    userId: string;
    userName: string;
    userImageSrc: string;
  } | null;
}

interface NotificationListProps {
  initialNotifications?: NotificationItemType[];
}

export function NotificationList({ initialNotifications = [] }: NotificationListProps) {
  const { notifications, unreadCount, mutate } = useNotifications();

  // Use SWR data if available, otherwise fall back to initial
  const items: NotificationItemType[] =
    notifications.length > 0 ? (notifications as NotificationItemType[]) : initialNotifications;

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PUT" });
      await mutate();
      toast.success("Toate notificările au fost marcate ca citite");
    } catch {
      toast.error("Eroare la actualizare");
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Nicio notificare</p>
        <p className="text-sm mt-1">Vei fi notificat când cineva interacționează cu postările tale</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            className="text-slate-400 hover:text-white text-xs"
          >
            Marchează toate ca citite
          </Button>
        </div>
      )}

      {items.map(({ notification, actor }) => {
        const href = notification.postId
          ? `/post/${notification.postId}${notification.commentId ? "#comentarii" : ""}`
          : "#";

        return (
          <Link key={notification.id} href={href}>
            <div
              className={`p-4 rounded-xl border transition-colors hover:bg-white/[0.07] ${
                !notification.isRead
                  ? "bg-blue-500/5 border-blue-500/20"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  {NOTIFICATION_ICONS[notification.type] ?? (
                    <Bell className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </div>

                {/* Actor avatar */}
                {actor && (
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarImage src={actor.userImageSrc} />
                    <AvatarFallback className="text-[10px] bg-blue-600">
                      {actor.userName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 leading-snug">
                    {actor && (
                      <span className="font-medium text-white">{actor.userName} </span>
                    )}
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {timeAgo(notification.createdAt)}
                  </p>
                </div>

                {/* Unread dot */}
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
