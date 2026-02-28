import { notFound } from "next/navigation";
import { db } from "@/db/drizzle";
import { networkUsers, posts } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/feed/post-card";
import { formatDate, formatNumber } from "@/lib/utils";
import { currentUser } from "@/lib/auth";
import { Award, FileText, MessageSquare } from "lucide-react";

interface PageProps {
  params: Promise<{ userId: string }>;
}

const EXPERIENCE_LABELS: Record<string, string> = {
  student: "Student",
  rezident: "Rezident",
  medic: "Medic",
};

async function getUserData(userId: string) {
  try {
    const [user] = await db
      .select()
      .from(networkUsers)
      .where(eq(networkUsers.userId, userId))
      .limit(1);

    if (!user) return null;

    const userPosts = await db
      .select()
      .from(posts)
      .where(and(eq(posts.userId, userId), eq(posts.isDeleted, false)))
      .orderBy(desc(posts.createdAt))
      .limit(10);

    return { user, posts: userPosts };
  } catch {
    return null;
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const { userId } = await params;
  const data = await getUserData(userId);
  if (!data) notFound();

  const { user, posts: userPosts } = data;
  const currentUserData = await currentUser();
  const _isOwnProfile = currentUserData?.id === userId;

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.userImageSrc} />
            <AvatarFallback className="bg-blue-600 text-white text-xl">
              {user.userName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white">{user.userName}</h1>
              {user.isVerified && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  ✓ Verificat
                </Badge>
              )}
              {user.role === "admin" && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  Admin
                </Badge>
              )}
            </div>
            {user.specialization && (
              <p className="text-slate-400 text-sm mt-0.5">{user.specialization}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Membru din {formatDate(user.joinedAt)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-400">
              {formatNumber(user.karma)}
            </div>
            <div className="text-xs text-slate-500">karma</div>
          </div>
        </div>

        {user.bio && (
          <p className="text-slate-400 text-sm mt-4 border-t border-white/10 pt-4">
            {user.bio}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 border-t border-white/10 pt-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{user.postCount}</div>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <FileText className="h-3 w-3" />
              Postări
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{user.commentCount}</div>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Comentarii
            </div>
          </div>
          <div className="text-center">
            <Badge
              className="text-xs"
              style={{
                backgroundColor:
                  user.experienceLevel === "medic"
                    ? "#4CAF5020"
                    : user.experienceLevel === "rezident"
                    ? "#2196F320"
                    : "#FFC10720",
                color:
                  user.experienceLevel === "medic"
                    ? "#4CAF50"
                    : user.experienceLevel === "rezident"
                    ? "#2196F3"
                    : "#FFC107",
              }}
            >
              <Award className="h-3 w-3 mr-1" />
              {EXPERIENCE_LABELS[user.experienceLevel] ?? user.experienceLevel}
            </Badge>
          </div>
        </div>
      </div>

      {/* Recent posts */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Postări recente</h2>
        {userPosts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-white/5 border border-white/10 rounded-xl">
            <p>Nicio postare încă</p>
          </div>
        ) : (
          userPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={{
                userId: user.userId,
                userName: user.userName,
                userImageSrc: user.userImageSrc,
                karma: user.karma,
                isVerified: user.isVerified,
              }}
              community={null}
            />
          ))
        )}
      </div>
    </div>
  );
}
