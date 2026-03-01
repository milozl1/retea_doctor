import { notFound } from "next/navigation";
import { db } from "@/db/drizzle";
import { networkUsers, posts, comments } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { currentUser } from "@/lib/auth";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileStats } from "@/components/profile/profile-stats";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { MedlearnStats } from "@/components/profile/medlearn-stats";

interface PageProps {
  params: Promise<{ userId: string }>;
}

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
      .limit(20);

    const userComments = await db
      .select()
      .from(comments)
      .where(and(eq(comments.userId, userId), eq(comments.isDeleted, false)))
      .orderBy(desc(comments.createdAt))
      .limit(20);

    return { user, posts: userPosts, comments: userComments };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { userId } = await params;
  const data = await getUserData(userId);
  return { title: data ? `${data.user.userName} — MedRețea` : "Profil — MedRețea" };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { userId } = await params;
  const data = await getUserData(userId);
  if (!data) notFound();

  const { user, posts: userPosts, comments: userComments } = data;
  const currentUserData = await currentUser();
  const isOwnProfile = currentUserData?.id === userId;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,280px] gap-6 items-start">
      {/* Main column */}
      <div className="space-y-6">
        <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
        <ProfileTabs
          userId={user.userId}
          userName={user.userName}
          userImageSrc={user.userImageSrc}
          karma={user.karma}
          isVerified={user.isVerified}
          posts={userPosts}
          comments={userComments}
        />
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <ProfileStats
          karma={user.karma}
          postCount={user.postCount}
          commentCount={user.commentCount}
          experienceLevel={user.experienceLevel}
        />
        {/* MedLearn cross-app stats (shown only when MEDLEARN_DATABASE_URL is set) */}
        <MedlearnStats userId={user.userId} />
      </div>
    </div>
  );
}

