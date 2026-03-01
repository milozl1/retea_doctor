import { Shield } from "lucide-react";

interface CommunityRulesProps {
  rules: string;
  communityName: string;
}

export function CommunityRules({ rules, communityName }: CommunityRulesProps) {
  if (!rules.trim()) return null;

  // Parse numbered rules (lines starting with "1." etc.)
  const ruleLines = rules
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">
          Regulile c/{communityName}
        </h3>
      </div>

      <ol className="space-y-2">
        {ruleLines.map((rule, index) => {
          // Remove leading number+dot if present (e.g., "1. Rule" → "Rule")
          const cleaned = rule.replace(/^\d+\.\s*/, "");
          return (
            <li key={index} className="flex items-start gap-2.5 text-sm">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-medium mt-0.5">
                {index + 1}
              </span>
              <span className="text-slate-400">{cleaned}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
