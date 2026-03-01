"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface CommentFormProps {
  postId: number;
  parentId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  compact?: boolean;
}

export function CommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
  placeholder = "Scrie un comentariu... (Markdown suportat)",
  compact = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          content: content.trim(),
          parentId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Eroare la trimitere");
      }

      setContent("");
      toast.success("Comentariu adăugat!");
      onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Eroare la adăugarea comentariului"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className={`bg-white/5 border-white/10 text-white placeholder:text-slate-600 ${
          compact ? "min-h-[80px]" : "min-h-[120px]"
        }`}
        maxLength={10000}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-600">Markdown suportat</p>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-slate-400"
            >
              Anulează
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !content.trim()}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Trimite
          </Button>
        </div>
      </div>
    </form>
  );
}
