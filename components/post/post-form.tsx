"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POST_TYPE_OPTIONS } from "@/config/constants";
import { Loader2, X, Plus } from "lucide-react";
import { toast } from "sonner";

interface Community {
  id: number;
  slug: string;
  name: string;
}

interface PostFormProps {
  communities: Community[];
  defaultCommunityId?: number;
}

export function PostForm({ communities, defaultCommunityId }: PostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("discussion");
  const [communityId, setCommunityId] = useState<string>(
    defaultCommunityId ? String(defaultCommunityId) : ""
  );
  const [tags, setTags] = useState<string[]>([]);
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
    if (!title.trim() || !communityId) {
      toast.error("Completează titlul și selectează o comunitate");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          type,
          communityId: parseInt(communityId),
          tags,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Eroare la creare");
      }

      const data = await res.json();
      toast.success("Postare creată cu succes!");
      router.push(`/post/${data.id}`);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Eroare la crearea postării"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Post Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Tip postare
        </label>
        <div className="flex flex-wrap gap-2">
          {POST_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${
                type === opt.value
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Community */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Comunitate *
        </label>
        <Select value={communityId} onValueChange={setCommunityId}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Selectează o comunitate" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            {communities.map((c) => (
              <SelectItem
                key={c.id}
                value={String(c.id)}
                className="text-slate-300"
              >
                c/{c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Titlu *</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Un titlu descriptiv pentru postarea ta"
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
          placeholder="Scrie conținutul postării tale... (Markdown suportat)"
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
            size="icon"
            onClick={addTag}
            disabled={tags.length >= 5}
            className="border-white/10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-white/5 text-slate-300 gap-1"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3 justify-end">
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
          disabled={isSubmitting || !title.trim() || !communityId}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Publică
        </Button>
      </div>
    </form>
  );
}
