import { NextRequest, NextResponse } from "next/server";
import { getCommentsForPost } from "@/db/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = parseInt(searchParams.get("postId") || "0");
  const sort =
    (searchParams.get("sort") as "best" | "new" | "old") || "best";

  if (!postId) {
    return NextResponse.json({ error: "postId este obligatoriu" }, { status: 400 });
  }

  const results = await getCommentsForPost(postId, sort);

  return NextResponse.json({ comments: results });
}
