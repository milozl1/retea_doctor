import { NextRequest, NextResponse } from "next/server";
import { joinCommunity } from "@/actions/vote-actions";
import { auth } from "@/lib/auth";
import { getCommunityBySlug } from "@/db/queries";

export async function POST(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const community = await getCommunityBySlug(params.slug);
  if (!community) {
    return NextResponse.json(
      { error: "Comunitatea nu a fost găsită" },
      { status: 404 }
    );
  }

  const result = await joinCommunity(community.id);
  return NextResponse.json(result);
}
