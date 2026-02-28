export const APP_NAME = "Rețea Medicală";
export const APP_DESCRIPTION =
  "Rețea de socializare profesională pentru medici și studenți la medicină";

export const POSTS_PER_PAGE = 20;
export const COMMENTS_PER_PAGE = 50;
export const NOTIFICATIONS_PER_PAGE = 20;
export const MAX_COMMENT_DEPTH = 5;
export const EDIT_WINDOW_MINUTES = 15;

export const SORT_OPTIONS = [
  { value: "hot", label: "Populare", icon: "🔥" },
  { value: "new", label: "Noi", icon: "🆕" },
  { value: "top", label: "Top", icon: "📊" },
] as const;

export const COMMENT_SORT_OPTIONS = [
  { value: "best", label: "Cele mai bune" },
  { value: "new", label: "Noi" },
  { value: "old", label: "Vechi" },
] as const;

export const POST_TYPE_OPTIONS = [
  { value: "discussion", label: "Discuție", icon: "💬", description: "Întrebare sau topic liber" },
  { value: "case_study", label: "Caz Clinic", icon: "🏥", description: "Prezentare caz clinic" },
  { value: "article", label: "Articol", icon: "📝", description: "Sharing de cunoștințe" },
  { value: "quick_question", label: "Întrebare Rapidă", icon: "❓", description: "Q&A scurt" },
  { value: "external_link", label: "Link Extern", icon: "🔗", description: "Articol sau studiu extern" },
] as const;

export const REPORT_REASONS = [
  "Spam",
  "Conținut ofensator",
  "Informații medicale false",
  "Date pacient neaonimizate",
  "Hărțuire",
  "Conținut irelevant",
  "Altele",
] as const;
