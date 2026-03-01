import { NextRequest, NextResponse } from "next/server";
import { voteOnComment } from "@/actions/vote-actions";
import { auth } from "@/lib/auth";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const rl = rateLimit(`vote:${userId}`, RATE_LIMITS.vote);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Prea multe voturi. Încearcă mai târziu." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const commentId = parseInt(params.id);

  const result = await voteOnComment({
    commentId,
    type: body.type,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
