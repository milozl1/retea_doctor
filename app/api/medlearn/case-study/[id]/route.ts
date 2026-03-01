import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMedlearnCaseStudy } from "@/lib/medlearn-client";
import { rateLimit } from "@/lib/rate-limit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/medlearn/case-study/[id]
 *
 * Fetches a MedLearn case study so that retea_doctor can pre-populate a new
 * "Caz Clinic" post with its data (title, description, patient history, etc.).
 *
 * Returns 503 when MEDLEARN_DATABASE_URL is not configured.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const start = Date.now();

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
  }

  const rl = rateLimit(`medlearn-case:${userId}`, { maxRequests: 30, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Prea multe cereri" }, { status: 429 });
  }

  const { id } = await params;
  const caseStudyId = parseInt(id, 10);
  if (isNaN(caseStudyId)) {
    return NextResponse.json({ error: "ID invalid" }, { status: 400 });
  }

  if (!process.env.MEDLEARN_DATABASE_URL) {
    return NextResponse.json(
      { error: "Integrarea MedLearn nu este configurată", available: false },
      { status: 503 }
    );
  }

  const caseStudy = await getMedlearnCaseStudy(caseStudyId);
  if (!caseStudy) {
    return NextResponse.json({ error: "Cazul clinic nu a fost găsit" }, { status: 404 });
  }

  const response = NextResponse.json({ caseStudy, available: true });
  response.headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
  return response;
}
