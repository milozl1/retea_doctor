import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMedlearnUserProfile } from "@/lib/medlearn-client";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

/**
 * GET /api/medlearn/user-progress/[userId]
 *
 * Returns a user's MedLearn progress (XP, streak, level, specialization)
 * for display on their retea_doctor profile page.
 *
 * Returns { profile: null, available: false } when MEDLEARN_DATABASE_URL is
 * not configured so the UI can gracefully hide the MedLearn stats section.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
  }

  if (!process.env.MEDLEARN_DATABASE_URL) {
    return NextResponse.json({ profile: null, available: false });
  }

  const { userId } = await params;
  const profile = await getMedlearnUserProfile(userId);
  return NextResponse.json({ profile, available: true });
}
