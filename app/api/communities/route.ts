import { NextResponse } from "next/server";
import { getCommunities } from "@/db/queries";

export async function GET() {
  const allCommunities = await getCommunities();
  return NextResponse.json({ communities: allCommunities });
}
