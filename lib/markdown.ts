import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

// Server-side markdown rendering with DOMPurify sanitization
export function renderMarkdown(content: string): string {
  const rawHtml = marked.parse(content, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml);
}

export function truncateMarkdown(content: string, maxLength: number = 200): string {
  // Strip markdown syntax for preview
  const stripped = content
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*|__/g, "")
    .replace(/\*|_/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/^\s*[-*+]\s/gm, "")
    .replace(/^\s*\d+\.\s/gm, "")
    .trim();

  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength) + "...";
}
