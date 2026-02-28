import { NextRequest, NextResponse } from "next/server";
import { searchPosts } from "@/db/queries";
import { auth } from "@/lib/auth";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { searchSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  const parsed = searchSchema.safeParse({ query: q });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Termeni de căutare invalizi" },
      { status: 400 }
    );
  }

  const { userId } = await auth();
  if (userId) {
    const rl = rateLimit(`search:${userId}`, RATE_LIMITS.search);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Prea multe căutări. Încearcă mai târziu." },
        { status: 429 }
      );
    }
  }

  const results = await searchPosts(parsed.data.q);

  return NextResponse.json({ results });
}
