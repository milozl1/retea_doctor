"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { timeAgo, cn } from "@/lib/utils";
import { MessageSquare, ArrowUp, AtSign, Bell } from "lucide-react";

interface NotificationData {
  notification: {
    id: number;
    type: string;
    postId: number | null;
    commentId: number | null;
    message: string;
    isRead: boolean;
    createdAt: string | Date;
  };
  actor: {
    userId: string;
    userName: string;
    userImageSrc: string;
  };
}

interface NotificationListProps {
  notifications: NotificationData[];
  onMarkRead?: (id: number) => void;
}

const NOTIFICATION_ICONS: Record<string, typeof MessageSquare> = {
  reply_post: MessageSquare,
  reply_comment: MessageSquare,
  upvote: ArrowUp,
  mention: AtSign,
  new_post_community: Bell,
};

export function NotificationList({
  notifications,
  onMarkRead,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="glass-card p-12 text-center space-y-3">
        <Bell className="h-12 w-12 text-slate-600 mx-auto" />
        <p className="text-slate-500">Nicio notificare</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {notifications.map((item) => {
        const Icon =
          NOTIFICATION_ICONS[item.notification.type] || Bell;
        const href = item.notification.postId
          ? `/post/${item.notification.postId}`
          : "#";

        return (
          <Link
            key={item.notification.id}
            href={href}
            className={cn(
              "flex items-start gap-3 p-3 rounded-xl transition-all duration-200",
              item.notification.isRead
                ? "hover:bg-white/5"
                : "bg-primary/5 border border-primary/10 hover:bg-primary/10"
            )}
            onClick={() => {
              if (!item.notification.isRead) {
                onMarkRead?.(item.notification.id);
              }
            }}
          >
            <Avatar className="h-8 w-8 mt-0.5">
              <AvatarImage src={item.actor.userImageSrc} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {item.actor.userName[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-300">
                <span className="font-medium text-white">
                  {item.actor.userName}
                </span>{" "}
                {item.notification.message}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {timeAgo(item.notification.createdAt)}
              </p>
            </div>

            <Icon className="h-4 w-4 text-slate-600 mt-1 shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
