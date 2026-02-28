"use client";

import { useMemo } from "react";
import { renderMarkdown } from "@/lib/markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const html = useMemo(() => renderMarkdown(content), [content]);

  return (
    <div
      className={`prose prose-invert prose-sm max-w-none ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
