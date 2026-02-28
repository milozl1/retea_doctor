import { NextRequest, NextResponse } from "next/server";
import { getPostById } from "@/db/queries";
import { auth } from "@/lib/auth";
import { getUserVoteOnPost, isPostBookmarked } from "@/db/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = parseInt(params.id);
  if (isNaN(postId)) {
    return NextResponse.json({ error: "ID invalid" }, { status: 400 });
  }

  const result = await getPostById(postId);
  if (!result) {
    return NextResponse.json(
      { error: "Postarea nu a fost găsită" },
      { status: 404 }
    );
  }

  const { userId } = await auth();
  let userVote: "upvote" | "downvote" | null = null;
  let bookmarked = false;

  if (userId) {
    const [vote, bm] = await Promise.all([
      getUserVoteOnPost(userId, postId),
      isPostBookmarked(userId, postId),
    ]);
    userVote = vote?.type ?? null;
    bookmarked = bm;
  }

  return NextResponse.json({
    ...result,
    userVote,
    bookmarked,
  });
}
