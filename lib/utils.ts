import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "acum câteva secunde";
  if (seconds < 3600) return `acum ${Math.floor(seconds / 60)} minute`;
  if (seconds < 86400) return `acum ${Math.floor(seconds / 3600)} ore`;
  if (seconds < 604800) return `acum ${Math.floor(seconds / 86400)} zile`;
  if (seconds < 2592000) return `acum ${Math.floor(seconds / 604800)} săptămâni`;
  if (seconds < 31536000) return `acum ${Math.floor(seconds / 2592000)} luni`;
  return `acum ${Math.floor(seconds / 31536000)} ani`;
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
