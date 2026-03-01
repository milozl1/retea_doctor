"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Plus } from "lucide-react";
import { toast } from "sonner";

interface EditPostFormProps {
  postId: number;
  initialTitle: string;
  initialContent: string;
  initialTags: string[];
}

export function EditPostForm({
  postId,
  initialTitle,
  initialContent,
  initialTags,
}: EditPostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Titlul nu poate fi gol");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Eroare la editare");
      }

      toast.success("Postare editată cu succes!");
      router.push(`/post/${postId}`);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Eroare la editarea postării"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Titlu *</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Un titlu descriptiv"
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
          maxLength={300}
        />
        <p className="text-xs text-slate-600">{title.length}/300</p>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Conținut (Markdown suportat)
        </label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Scrie conținutul postării..."
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 min-h-[200px]"
          maxLength={40000}
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Tag-uri (max 5)
        </label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Adaugă un tag"
            className="bg-white/5 border-white/10 text-white"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTag}
            disabled={tags.length >= 5}
            className="border-white/10 text-slate-300"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-white/10 text-slate-300 gap-1"
              >
                #{tag}
                <button type="button" onClick={() => removeTag(tag)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="text-slate-400"
        >
          Anulează
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="bg-gradient-to-r from-primary to-blue-500 text-white"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Salvează modificările
        </Button>
      </div>
    </form>
  );
}
