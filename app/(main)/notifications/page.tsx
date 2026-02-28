import { requireAuth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { notifications, networkUsers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { timeAgo } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Notificări</h1>
      </div>

      {notifs.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white/5 border border-white/10 rounded-xl">
          <div className="text-5xl mb-4">🔔</div>
          <p>Nicio notificare</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(({ notification, actor }) => (
            <div
              key={notification.id}
              className={`bg-white/5 border rounded-xl p-4 transition-colors ${
                !notification.isRead
                  ? "border-blue-500/30 bg-blue-500/5"
                  : "border-white/10"
              }`}
            >
              <div className="flex items-start gap-3">
                {actor && (
                  <Link href={`/u/${actor.userId}`}>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={actor.userImageSrc} />
                      <AvatarFallback className="text-xs bg-blue-600">
                        {actor.userName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300">{notification.message}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {timeAgo(notification.createdAt)}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
