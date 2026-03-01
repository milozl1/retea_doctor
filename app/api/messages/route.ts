import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import {
  conversations,
  conversationParticipants,
  messages,
  networkUsers,
} from "@/db/schema";
import { eq, desc, and, sql, ne } from "drizzle-orm";

// GET — list conversations for current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  // Get conversations where user is a participant
  const userConversations = await db
    .select({
      conversationId: conversationParticipants.conversationId,
      lastReadAt: conversationParticipants.lastReadAt,
    })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, userId));

  if (userConversations.length === 0) {
    return NextResponse.json({ conversations: [] });
  }

  const convIds = userConversations.map((c) => c.conversationId);

  // Get conversation details with other participant and last message
  const result = await Promise.all(
    convIds.map(async (convId) => {
      const userConv = userConversations.find((c) => c.conversationId === convId)!;

      // Get other participant
      const [otherParticipant] = await db
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
            eq(conversationParticipants.conversationId, convId),
            ne(conversationParticipants.userId, userId)
          )
        )
        .limit(1);

      // Get last message
      const [lastMessage] = await db
        .select({
          id: messages.id,
          content: messages.content,
          senderId: messages.senderId,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(eq(messages.conversationId, convId))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      // Count unread
      const [unreadResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, convId),
            ne(messages.senderId, userId),
            userConv.lastReadAt
              ? sql`${messages.createdAt} > ${userConv.lastReadAt}`
              : sql`true`
          )
        );

      return {
        id: convId,
        otherUser: otherParticipant || null,
        lastMessage: lastMessage || null,
        unreadCount: unreadResult?.count ?? 0,
      };
    })
  );

  // Sort by last message time
  result.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt
      ? new Date(a.lastMessage.createdAt).getTime()
      : 0;
    const bTime = b.lastMessage?.createdAt
      ? new Date(b.lastMessage.createdAt).getTime()
      : 0;
    return bTime - aTime;
  });

  return NextResponse.json({ conversations: result });
}

// POST — create new conversation or find existing one
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await req.json();
  const { recipientId } = body;

  if (!recipientId || recipientId === userId) {
    return NextResponse.json(
      { error: "Destinatar invalid" },
      { status: 400 }
    );
  }

  // Check recipient exists
  const [recipient] = await db
    .select({ userId: networkUsers.userId })
    .from(networkUsers)
    .where(eq(networkUsers.userId, recipientId))
    .limit(1);

  if (!recipient) {
    return NextResponse.json(
      { error: "Utilizator negăsit" },
      { status: 404 }
    );
  }

  // Check if conversation already exists between these two users
  const myConvs = await db
    .select({ conversationId: conversationParticipants.conversationId })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, userId));

  for (const conv of myConvs) {
    const [otherInConv] = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conv.conversationId),
          eq(conversationParticipants.userId, recipientId)
        )
      )
      .limit(1);

    if (otherInConv) {
      return NextResponse.json({ conversationId: conv.conversationId });
    }
  }

  // Create new conversation
  const [newConv] = await db
    .insert(conversations)
    .values({})
    .returning();

  await db.insert(conversationParticipants).values([
    { conversationId: newConv.id, userId },
    { conversationId: newConv.id, userId: recipientId },
  ]);

  return NextResponse.json({ conversationId: newConv.id }, { status: 201 });
}
