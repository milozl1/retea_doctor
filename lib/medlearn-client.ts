/**
 * Server-side helpers for reading data from the Doctor/MedLearn database.
 *
 * All functions gracefully handle the case where MEDLEARN_DATABASE_URL is not
 * configured — they return null / empty so retea_doctor works standalone.
 *
 * Data is cached with Next.js unstable_cache to reduce DB round-trips on the
 * free tier:
 *   • User profile  — 5 min TTL (changes when user levels up in MedLearn)
 *   • Case study    — 1 hour TTL (rarely edited)
 *   • Specializations — 24 hour TTL (almost static)
 */

import { medlearnDb } from "@/db/medlearn-drizzle";
import { userProgress, specializations, caseStudies } from "@/db/medlearn-schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MedlearnUserProfile {
  userId: string;
  userName: string;
  userImageSrc: string;
  experienceLevel: string;
  points: number;
  streak: number;
  specializationId: number | null;
  specializationName: string | null;
  specializationColor: string | null;
}

export interface MedlearnCaseStudy {
  id: number;
  title: string;
  description: string;
  patientHistory: string;
  presentation: string;
  category: string;
  difficulty: string;
  specializationId: number | null;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export const getMedlearnUserProfile = unstable_cache(
  async (userId: string): Promise<MedlearnUserProfile | null> => {
    if (!medlearnDb) return null;
    try {
      const [row] = await medlearnDb
        .select({
          userId: userProgress.userId,
          userName: userProgress.userName,
          userImageSrc: userProgress.userImageSrc,
          experienceLevel: userProgress.experienceLevel,
          points: userProgress.points,
          streak: userProgress.streak,
          specializationId: userProgress.specializationId,
          specializationName: specializations.name,
          specializationColor: specializations.color,
        })
        .from(userProgress)
        .leftJoin(specializations, eq(userProgress.specializationId, specializations.id))
        .where(eq(userProgress.userId, userId))
        .limit(1);

      if (!row) return null;
      return {
        userId: row.userId,
        userName: row.userName,
        userImageSrc: row.userImageSrc,
        experienceLevel: row.experienceLevel,
        points: row.points,
        streak: row.streak,
        specializationId: row.specializationId ?? null,
        specializationName: row.specializationName ?? null,
        specializationColor: row.specializationColor ?? null,
      };
    } catch {
      return null;
    }
  },
  ["medlearn-user-profile"],
  { revalidate: 300 }
);

// ─── Case Study ───────────────────────────────────────────────────────────────

export const getMedlearnCaseStudy = unstable_cache(
  async (id: number): Promise<MedlearnCaseStudy | null> => {
    if (!medlearnDb) return null;
    try {
      const [row] = await medlearnDb
        .select()
        .from(caseStudies)
        .where(eq(caseStudies.id, id))
        .limit(1);

      if (!row || !row.isPublished) return null;
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        patientHistory: row.patientHistory,
        presentation: row.presentation,
        category: row.category,
        difficulty: row.difficulty,
        specializationId: row.specializationId ?? null,
      };
    } catch {
      return null;
    }
  },
  ["medlearn-case-study"],
  { revalidate: 3600 }
);

// ─── Specializations ──────────────────────────────────────────────────────────

export const getMedlearnSpecializations = unstable_cache(
  async (): Promise<{ id: number; name: string; color: string }[]> => {
    if (!medlearnDb) return [];
    try {
      return await medlearnDb
        .select({ id: specializations.id, name: specializations.name, color: specializations.color })
        .from(specializations);
    } catch {
      return [];
    }
  },
  ["medlearn-specializations"],
  { revalidate: 86400 }
);
