"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CommentFormProps {
  postId: number;
  parentId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function CommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
  placeholder = "Adaugă un comentariu...",
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, parentId, content: content.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? "Eroare la postarea comentariului");
      }

      setContent("");
      toast.success("Comentariu adăugat!");
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Eroare la postarea comentariului"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 resize-none min-h-[80px]"
        rows={3}
      />
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-slate-400 hover:text-white"
          >
            Anulează
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? "Se postează..." : "Comentează"}
        </Button>
      </div>
    </form>
  );
}
