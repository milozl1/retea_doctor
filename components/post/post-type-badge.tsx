import { cn } from "@/lib/utils";
import { POST_TYPE_LABELS, POST_TYPE_COLORS } from "@/lib/utils";

interface PostTypeBadgeProps {
  type: string;
}

const TYPE_ICONS: Record<string, string> = {
  discussion: "💬",
  case_study: "🩺",
  article: "📝",
  quick_question: "⚡",
  external_link: "🔗",
};

export function PostTypeBadge({ type }: PostTypeBadgeProps) {
  const label = POST_TYPE_LABELS[type] ?? type;
  const icon = TYPE_ICONS[type] ?? "📌";

  const colorMap: Record<string, string> = {
    discussion: "bg-blue-500/[0.08] text-blue-400 border-blue-500/[0.12]",
    case_study: "bg-emerald-500/[0.08] text-emerald-400 border-emerald-500/[0.12]",
    article: "bg-violet-500/[0.08] text-violet-400 border-violet-500/[0.12]",
    quick_question: "bg-amber-500/[0.08] text-amber-400 border-amber-500/[0.12]",
    external_link: "bg-cyan-500/[0.08] text-cyan-400 border-cyan-500/[0.12]",
  };

  const colorClass = colorMap[type] ?? "bg-slate-500/[0.08] text-slate-400 border-slate-500/[0.12]";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wide",
        colorClass
      )}
    >
      <span className="text-[9px]">{icon}</span>
      {label}
    </span>
  );
}
