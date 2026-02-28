"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useModalStore } from "@/stores/modal-store";
import { toast } from "sonner";

const REPORT_REASONS = [
  "Spam",
  "Conținut fals/înșelător",
  "Hărțuire",
  "Informații medicale periculoase",
  "Conținut inadecvat",
  "Altul",
];

export function ReportModal() {
  const { isReportModalOpen, reportPostId, reportCommentId, closeReportModal } =
    useModalStore();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          details: details.trim() || undefined,
          postId: reportPostId ?? undefined,
          commentId: reportCommentId ?? undefined,
        }),
      });
      if (!response.ok) throw new Error("Eroare la raportare");
      toast.success("Raport trimis. Mulțumim!");
      closeReportModal();
      setReason("");
      setDetails("");
    } catch {
      toast.error("Eroare la trimiterea raportului");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isReportModalOpen} onOpenChange={closeReportModal}>
      <DialogContent className="bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Raportează conținut</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  reason === r
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 border border-transparent"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Detalii suplimentare (opțional)"
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 resize-none"
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={closeReportModal} className="text-slate-400">
              Anulează
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!reason || isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Raportează
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
