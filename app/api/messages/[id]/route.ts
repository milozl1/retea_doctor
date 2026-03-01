import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import {
  conversationParticipants,
  messages,
  networkUsers,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET — get messages for a conversation
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const conversationId = parseInt(params.id);
  if (isNaN(conversationId)) {
    return NextResponse.json({ error: "ID invalid" }, { status: 400 });
  }

  // Verify user is participant
  const [participant] = await db
    .select()
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId)
      )
    )
    .limit(1);

  if (!participant) {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  // Get messages
  const msgs = await db
    .select({
      id: messages.id,
      content: messages.content,
      senderId: messages.senderId,
      isDeleted: messages.isDeleted,
      createdAt: messages.createdAt,
      senderName: networkUsers.userName,
      senderImage: networkUsers.userImageSrc,
    })
    .from(messages)
    .innerJoin(networkUsers, eq(messages.senderId, networkUsers.userId))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(100);

  // Mark as read
  await db
    .update(conversationParticipants)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId)
      )
    );

  return NextResponse.json({ messages: msgs.reverse() });
}

// POST — send message
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const conversationId = parseInt(params.id);
  if (isNaN(conversationId)) {
    return NextResponse.json({ error: "ID invalid" }, { status: 400 });
  }

  // Verify user is participant
  const [participant] = await db
    .select()
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId)
      )
    )
    .limit(1);

  if (!participant) {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  const body = await req.json();
  const { content } = body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json(
      { error: "Mesajul nu poate fi gol" },
      { status: 400 }
    );
  }

  if (content.length > 5000) {
    return NextResponse.json(
      { error: "Mesajul este prea lung" },
      { status: 400 }
    );
  }

  const [message] = await db
    .insert(messages)
    .values({
      conversationId,
      senderId: userId,
      content: content.trim(),
    })
    .returning();

  return NextResponse.json({ message }, { status: 201 });
}
