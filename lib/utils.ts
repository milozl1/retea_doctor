import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "acum";
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h`;
  }
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `${days}z`;
  }
  if (seconds < 2592000) {
    const weeks = Math.floor(seconds / 604800);
    return `${weeks}săpt`;
  }
  if (seconds < 31536000) {
    const months = Math.floor(seconds / 2592000);
    return `${months}l`;
  }
  const years = Math.floor(seconds / 31536000);
  return `${years}a`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ăâ]/g, "a")
    .replace(/[îí]/g, "i")
    .replace(/[șş]/g, "s")
    .replace(/[țţ]/g, "t")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const POST_TYPE_LABELS: Record<string, string> = {
  case_study: "Caz Clinic",
  discussion: "Discuție",
  article: "Articol",
  quick_question: "Întrebare Rapidă",
  external_link: "Link Extern",
};

export const POST_TYPE_COLORS: Record<string, string> = {
  case_study: "bg-emergency-500/20 text-emergency-500 border-emergency-500/30",
  discussion: "bg-primary-500/20 text-primary-500 border-primary-500/30",
  article: "bg-clinical-500/20 text-clinical-500 border-clinical-500/30",
  quick_question: "bg-warning-500/20 text-warning-500 border-warning-500/30",
  external_link: "bg-indigo-500/20 text-indigo-500 border-indigo-500/30",
};

export const EXPERIENCE_LABELS: Record<string, string> = {
  student: "Student",
  rezident: "Rezident",
  medic: "Medic",
  doctor: "Doctor",
};
