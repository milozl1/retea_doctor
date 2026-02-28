import { Badge } from "@/components/ui/badge";
import { POST_TYPES, POST_TYPE_COLORS } from "@/config/constants";

type PostType = keyof typeof POST_TYPES;

interface PostTypeBadgeProps {
  type: PostType;
}

export function PostTypeBadge({ type }: PostTypeBadgeProps) {
  const label = POST_TYPES[type] ?? type;
  const color = POST_TYPE_COLORS[type] ?? "#2196F3";

  return (
    <Badge
      style={{ backgroundColor: color + "20", color, borderColor: color + "40" }}
      variant="outline"
      className="text-xs font-medium border"
    >
      {label}
    </Badge>
  );
}
