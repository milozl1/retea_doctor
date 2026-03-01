"use client";

import { renderMarkdown } from "@/lib/markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const html = renderMarkdown(content);

  return (
    <div
      className={`prose prose-invert prose-sm max-w-none
        prose-headings:text-white prose-headings:font-semibold
        prose-p:text-slate-300 prose-p:leading-relaxed
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-white
        prose-code:text-primary prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm
        prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
        prose-blockquote:border-primary/50 prose-blockquote:text-slate-400
        prose-li:text-slate-300
        prose-img:rounded-xl
        ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
