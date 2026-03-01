"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, User } from "lucide-react";
import { toast } from "sonner";
import { EXPERIENCE_LABELS } from "@/lib/utils";

interface SettingsFormProps {
  initialData: {
    userName: string;
    bio: string;
    specialization: string;
    experienceLevel: string;
  };
}

const SPECIALIZATIONS = [
  "Medicină Generală",
  "Cardiologie",
  "Chirurgie",
  "Dermatologie",
  "Endocrinologie",
  "Gastroenterologie",
  "Ginecologie",
  "Hematologie",
  "Medicină Internă",
  "Neurologie",
  "Oftalmologie",
  "Oncologie",
  "ORL",
  "Ortopedie",
  "Pediatrie",
  "Pneumologie",
  "Psihiatrie",
  "Radiologie",
  "Reumatologie",
  "Urologie",
  "Medicină de Urgență",
  "ATI",
  "Medicină de Familie",
];

export function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState(initialData.userName);
  const [bio, setBio] = useState(initialData.bio);
  const [specialization, setSpecialization] = useState(initialData.specialization);
  const [experienceLevel, setExperienceLevel] = useState(initialData.experienceLevel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      toast.error("Numele nu poate fi gol");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: userName.trim(),
          bio: bio.trim(),
          specialization: specialization.trim(),
          experienceLevel,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Eroare la actualizare");
      }

      toast.success("Profil actualizat cu succes!");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Eroare la actualizarea profilului"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Username */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <User className="h-4 w-4 text-slate-500" />
          Nume afișat *
        </label>
        <Input
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Numele tău"
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
          maxLength={50}
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Bio
        </label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Scrie câteva cuvinte despre tine..."
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 min-h-[100px]"
          maxLength={500}
        />
        <p className="text-xs text-slate-600">{bio.length}/500</p>
      </div>

      {/* Experience Level */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Nivel experiență
        </label>
        <Select value={experienceLevel} onValueChange={setExperienceLevel}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            {Object.entries(EXPERIENCE_LABELS).map(([value, label]) => (
              <SelectItem
                key={value}
                value={value}
                className="text-slate-300"
              >
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Specialization */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Specializare
        </label>
        <Select value={specialization} onValueChange={setSpecialization}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Selectează specializarea" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10 max-h-[300px]">
            <SelectItem value="" className="text-slate-500">
              Niciuna
            </SelectItem>
            {SPECIALIZATIONS.map((spec) => (
              <SelectItem
                key={spec}
                value={spec}
                className="text-slate-300"
              >
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting || !userName.trim()}
          className="bg-gradient-to-r from-primary to-blue-500 text-white gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvează
        </Button>
      </div>
    </form>
  );
}
