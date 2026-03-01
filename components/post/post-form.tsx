"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const POST_TYPES = [
  { value: "discussion", label: "💬 Discuție" },
  { value: "case_study", label: "🩺 Caz Clinic" },
  { value: "article", label: "📄 Articol" },
  { value: "quick_question", label: "❓ Întrebare Rapidă" },
  { value: "external_link", label: "🔗 Link Extern" },
] as const;

interface Community {
  id: number;
  name: string;
  slug: string;
}

export function PostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaultCommunityId = searchParams.get("communityId")
    ? parseInt(searchParams.get("communityId")!)
    : null;
  // Support ?caseStudyId=N to pre-populate from a MedLearn case study
  const caseStudyIdParam = searchParams.get("caseStudyId")
    ? parseInt(searchParams.get("caseStudyId")!)
    : null;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<string>("discussion");
  const [communityId, setCommunityId] = useState<number | null>(defaultCommunityId);
  const [linkUrl, setLinkUrl] = useState("");
  const [tags, setTags] = useState("");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingCase, setIsFetchingCase] = useState(false);

  // Load communities list
  useEffect(() => {
    fetch("/api/communities")
      .then((r) => r.json())
      .then((data) => setCommunities(data.communities ?? []))
      .catch(console.error);
  }, []);

  // Pre-populate from MedLearn case study when ?caseStudyId= is present
  useEffect(() => {
    if (!caseStudyIdParam) return;
    setIsFetchingCase(true);
    setType("case_study");
    fetch(`/api/medlearn/case-study/${caseStudyIdParam}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.caseStudy) {
          const cs = data.caseStudy;
          setTitle(cs.title ?? "");
          // Build rich markdown content from case study fields
          const parts: string[] = [];
          if (cs.description) parts.push(`## Descriere\n\n${cs.description}`);
          if (cs.patientHistory) parts.push(`## Istoric pacient\n\n${cs.patientHistory}`);
          if (cs.presentation) parts.push(`## Prezentare clinică\n\n${cs.presentation}`);
          if (cs.category) setTags(cs.category);
          setContent(parts.join("\n\n"));
          toast.success("Caz clinic importat din MedLearn!");
        }
      })
      .catch(() => toast.error("Nu s-a putut importa cazul din MedLearn"))
      .finally(() => setIsFetchingCase(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseStudyIdParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !communityId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          type,
          communityId,
          linkUrl: linkUrl.trim() || null,
          tags: tagArray,
          caseStudyId: caseStudyIdParam ?? undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? "Eroare la postare");
      }

      const data = await response.json();
      toast.success("Postare creată cu succes!");
      router.push(`/post/${data.post.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Eroare la postare"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* MedLearn import banner */}
      {caseStudyIdParam && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2 text-sm text-blue-300 flex items-center gap-2">
          <span>📚</span>
          {isFetchingCase
            ? "Se importă cazul din MedLearn..."
            : "Caz importat din MedLearn — editează înainte de a publica."}
        </div>
      )}

      {/* Type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {POST_TYPES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
              type === value
                ? "bg-blue-600 text-white"
                : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Community */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Comunitate <span className="text-red-400">*</span>
        </label>
        <select
          value={communityId ?? ""}
          onChange={(e) =>
            setCommunityId(e.target.value ? parseInt(e.target.value) : null)
          }
          required
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Selectează o comunitate...</option>
          {communities.map((c) => (
            <option key={c.id} value={c.id} className="bg-slate-800">
              c/{c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Titlu <span className="text-red-400">*</span>
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titlul postării..."
          required
          maxLength={300}
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
        />
        <p className="text-xs text-slate-500 mt-1">{title.length}/300</p>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Conținut (Markdown suportat)
        </label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Scrie conținutul postării... (Markdown suportat)"
          rows={8}
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 resize-none"
        />
      </div>

      {/* Link URL (for external_link type) */}
      {type === "external_link" && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            URL Link <span className="text-red-400">*</span>
          </label>
          <Input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            type="url"
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>
      )}

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Taguri (separate prin virgulă)
        </label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="cardiologie, infarct, tratament..."
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="text-slate-400 hover:text-white"
        >
          Anulează
        </Button>
        <Button
          type="submit"
          disabled={!title.trim() || !communityId || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
        >
          {isSubmitting ? "Se publică..." : "Publică postarea"}
        </Button>
      </div>
    </form>
  );
}
