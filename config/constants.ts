export const RATE_LIMITS = {
  VOTES_PER_MINUTE: 30,
  POSTS_PER_HOUR: 5,
  COMMENTS_PER_MINUTE: 20,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
} as const;

export const COMMENT_MAX_DEPTH = 5;
export const COMMENT_EDIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const POST_TYPES = {
  case_study: "Caz Clinic",
  discussion: "Discuție",
  article: "Articol",
  quick_question: "Întrebare Rapidă",
  external_link: "Link Extern",
} as const;

export const POST_TYPE_COLORS = {
  case_study: "#F44336",
  discussion: "#2196F3",
  article: "#4CAF50",
  quick_question: "#FFC107",
  external_link: "#9C27B0",
} as const;

export const EXPERIENCE_LEVELS = {
  student: "Student",
  rezident: "Rezident",
  medic: "Medic",
} as const;
