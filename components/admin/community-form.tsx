"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Save } from "lucide-react";
import { toast } from "sonner";

const COLOR_OPTIONS = [
  "#2196F3", "#4CAF50", "#F44336", "#FF9800", "#9C27B0",
  "#00BCD4", "#E91E63", "#607D8B", "#795548", "#3F51B5",
];

interface CommunityFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: number;
    name: string;
    description: string | null;
    rules: string | null;
    color: string;
    iconSrc: string | null;
  };
}

export function CommunityForm({ mode, initialData }: CommunityFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [rules, setRules] = useState(initialData?.rules ?? "");
  const [color, setColor] = useState(initialData?.color ?? "#2196F3");
  const [iconSrc, setIconSrc] = useState(initialData?.iconSrc ?? "🏥");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Numele comunității este obligatoriu");
      return;
    }

    setIsSubmitting(true);
    try {
      const method = mode === "create" ? "POST" : "PATCH";
      const body: Record<string, unknown> = {
        name: name.trim(),
        description: description.trim(),
        rules: rules.trim(),
        color,
        iconSrc,
      };
      if (mode === "edit" && initialData) {
        body.id = initialData.id;
      }

      const res = await fetch("/api/admin/communities", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Eroare");
      }

      toast.success(
        mode === "create"
          ? "Comunitate creată cu succes!"
          : "Comunitate actualizată cu succes!"
      );
      router.push("/admin/communities");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Eroare la salvare"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Nume *</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex: Cardiologie"
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
          maxLength={100}
        />
      </div>

      {/* Icon */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Emoji icon</label>
        <Input
          value={iconSrc}
          onChange={(e) => setIconSrc(e.target.value)}
          placeholder="🏥"
          className="bg-white/5 border-white/10 text-white w-24 text-center text-xl"
          maxLength={10}
        />
      </div>

      {/* Color */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Culoare</label>
        <div className="flex gap-2 flex-wrap">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-lg transition-all ${
                color === c ? "ring-2 ring-white scale-110" : "ring-1 ring-white/10"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <Input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 p-0 border-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Descriere</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="O scurtă descriere a comunității..."
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 min-h-[100px]"
          maxLength={2000}
        />
      </div>

      {/* Rules */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Reguli</label>
        <Textarea
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          placeholder="Regulile comunității (opțional)..."
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 min-h-[120px]"
          maxLength={5000}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : mode === "create" ? (
          <Plus className="h-4 w-4 mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        {mode === "create" ? "Creează comunitate" : "Salvează modificările"}
      </Button>
    </form>
  );
}
