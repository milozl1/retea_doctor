import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { conversationParticipants, networkUsers } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { ConversationClient } from "./conversation-client";

export default async function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const conversationId = parseInt(params.id);
  if (isNaN(conversationId)) {
    notFound();
  }

  const { userId } = await requireAuth();

  // Check user is in this conversation
  const [myParticipation] = await db
    .select()
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId)
      )
    )
    .limit(1);

  if (!myParticipation) {
    notFound();
  }

  // Get other participant
  const [otherUser] = await db
    .select({
      userId: networkUsers.userId,
      userName: networkUsers.userName,
      userImageSrc: networkUsers.userImageSrc,
      specialization: networkUsers.specialization,
      isVerified: networkUsers.isVerified,
    })
    .from(conversationParticipants)
    .innerJoin(
      networkUsers,
      eq(conversationParticipants.userId, networkUsers.userId)
    )
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        ne(conversationParticipants.userId, userId)
      )
    )
    .limit(1);

  return (
    <ConversationClient
      conversationId={conversationId}
      currentUserId={userId}
      otherUser={otherUser}
    />
  );
}
