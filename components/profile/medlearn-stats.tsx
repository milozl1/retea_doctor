"use client";

import useSWR from "swr";
import { ExternalLink, Zap, Flame, Award } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface MedlearnStatsProps {
  userId: string;
}

interface MedlearnProfile {
  points: number;
  streak: number;
  experienceLevel: string;
  specializationName: string | null;
  specializationColor: string | null;
}

const EXPERIENCE_LABELS: Record<string, string> = {
  student: "Student",
  rezident: "Rezident",
  medic: "Medic",
};

const EXPERIENCE_COLORS: Record<string, string> = {
  student: "#FFC107",
  rezident: "#2196F3",
  medic: "#4CAF50",
};

const MEDLEARN_URL = process.env.NEXT_PUBLIC_MEDLEARN_URL ?? "";

export function MedlearnStats({ userId }: MedlearnStatsProps) {
  const { data, isLoading } = useSWR<{
    profile: MedlearnProfile | null;
    available: boolean;
  }>(`/api/medlearn/user-progress/${userId}`, {
    revalidateOnFocus: false,
    dedupingInterval: 300_000, // 5 min — matches server cache TTL
  });

  // Not configured or loading
  if (isLoading || !data?.available) return null;
  // No profile in MedLearn yet
  if (!data.profile) return null;

  const { points, streak, experienceLevel, specializationName, specializationColor } =
    data.profile;

  const expLabel = EXPERIENCE_LABELS[experienceLevel] ?? experienceLevel;
  const expColor = EXPERIENCE_COLORS[experienceLevel] ?? "#94a3b8";

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
          <span>📚</span> MedLearn
        </h3>
        {MEDLEARN_URL && (
          <a
            href={MEDLEARN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded-lg px-3 py-2 flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Puncte XP</p>
            <p className="text-sm font-semibold text-white">{formatNumber(points)}</p>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg px-3 py-2 flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Streak</p>
            <p className="text-sm font-semibold text-white">{streak} zile</p>
          </div>
        </div>
      </div>

      {/* Level badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${expColor}20`,
            color: expColor,
            border: `1px solid ${expColor}40`,
          }}
        >
          <Award className="h-3 w-3" />
          {expLabel}
        </span>

        {specializationName && (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${specializationColor ?? "#2196F3"}20`,
              color: specializationColor ?? "#2196F3",
              border: `1px solid ${specializationColor ?? "#2196F3"}40`,
            }}
          >
            {specializationName}
          </span>
        )}
      </div>
    </div>
  );
}
