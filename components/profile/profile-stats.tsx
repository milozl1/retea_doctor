import { formatNumber } from "@/lib/utils";
import { TrendingUp, FileText, MessageSquare, Award, Star } from "lucide-react";

interface ProfileStatsProps {
  karma: number;
  postCount: number;
  commentCount: number;
  experienceLevel: string;
}

const EXPERIENCE_CONFIG: Record<
  string,
  { label: string; color: string; description: string }
> = {
  student: {
    label: "Student",
    color: "#FFC107",
    description: "Student la medicină",
  },
  rezident: {
    label: "Rezident",
    color: "#2196F3",
    description: "Medic rezident",
  },
  medic: {
    label: "Medic",
    color: "#4CAF50",
    description: "Medic specialist",
  },
};

export function ProfileStats({
  karma,
  postCount,
  commentCount,
  experienceLevel,
}: ProfileStatsProps) {
  const exp = EXPERIENCE_CONFIG[experienceLevel] ?? {
    label: experienceLevel,
    color: "#94a3b8",
    description: "Utilizator",
  };

  const stats = [
    {
      label: "Karma",
      value: formatNumber(karma),
      icon: TrendingUp,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
    {
      label: "Postări",
      value: formatNumber(postCount),
      icon: FileText,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Comentarii",
      value: formatNumber(commentCount),
      icon: MessageSquare,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        Statistici
      </h3>

      {/* Stat cards */}
      <div className="space-y-2">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div>
              <div className={`text-lg font-bold ${color}`}>{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Experience level */}
      <div className="border-t border-white/10 pt-3">
        <div
          className="flex items-center gap-2 p-2.5 rounded-lg"
          style={{ backgroundColor: exp.color + "15" }}
        >
          <Award className="h-4 w-4" style={{ color: exp.color }} />
          <div>
            <div
              className="text-sm font-semibold"
              style={{ color: exp.color }}
            >
              {exp.label}
            </div>
            <div className="text-xs text-slate-500">{exp.description}</div>
          </div>
        </div>
      </div>

      {/* Karma tiers */}
      <div className="border-t border-white/10 pt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Star className="h-3.5 w-3.5 text-yellow-400" />
          <span className="text-xs font-medium text-slate-400">Rang karma</span>
        </div>
        {getKarmaRanks().map((item) => (
          <div key={item.threshold} className="flex items-center gap-2 text-xs py-0.5">
            <span>{item.icon}</span>
            <span
              className={
                karma >= item.threshold ? "text-white" : "text-slate-600"
              }
            >
              {item.label}
            </span>
            <span className="text-slate-600 ml-auto">{item.threshold}+</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getKarmaRanks() {
  return [
    { threshold: 0, label: "Nou venit", icon: "🌱" },
    { threshold: 10, label: "Contribuitor", icon: "💊" },
    { threshold: 100, label: "Rezident activ", icon: "🩺" },
    { threshold: 500, label: "Specialist", icon: "⚕️" },
    { threshold: 1000, label: "Expert medical", icon: "🏥" },
    { threshold: 5000, label: "Autoritate medicală", icon: "🎓" },
  ];
}
