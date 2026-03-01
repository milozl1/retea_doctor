"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send, Loader2, CheckCircle } from "lucide-react";
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
import { toast } from "sonner";

const SUBJECTS = [
  "Întrebare generală",
  "Raportare problemă",
  "Solicitare ștergere cont",
  "Solicitare date personale (GDPR)",
  "Sugestie funcționalitate",
  "Altele",
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject || !message.trim()) {
      toast.error("Completează toate câmpurile");
      return;
    }
    setIsSubmitting(true);
    // Simulate send (in production, this would be an API call)
    await new Promise((r) => setTimeout(r, 1500));
    setSent(true);
    setIsSubmitting(false);
    toast.success("Mesaj trimis cu succes!");
  };

  if (sent) {
    return (
      <div className="space-y-4">
        <div className="glass-card p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Mesaj Trimis!</h1>
              <p className="text-xs text-slate-500">
                Îți vom răspunde în cel mai scurt timp
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card p-8 text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto" />
          <p className="text-slate-300">
            Mulțumim pentru mesaj! Vom reveni cu un răspuns în maximum 48 de ore.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
          >
            Înapoi la feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Contact</h1>
            <p className="text-xs text-slate-500">
              Trimite-ne un mesaj și te vom contacta în cel mai scurt timp
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Nume *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Numele tău"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Email *
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplu.ro"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Subiect *
            </label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Selectează subiectul" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s} className="text-slate-300">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Mesaj *
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descrie pe scurt problema sau întrebarea ta..."
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 min-h-[150px]"
              maxLength={2000}
            />
            <p className="text-xs text-slate-600">{message.length}/2000</p>
          </div>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !name.trim() ||
              !email.trim() ||
              !subject ||
              !message.trim()
            }
            className="bg-gradient-to-r from-primary to-blue-500 text-white gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Trimite mesajul
          </Button>
        </form>
      </div>
    </div>
  );
}
