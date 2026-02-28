"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useModal } from "@/stores/modal-store";
import { REPORT_REASONS } from "@/config/constants";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ReportModal() {
  const { isOpen, type, data, onClose } = useModal();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReportModal = isOpen && type === "report";

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Selectează un motiv");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          details: details.trim() || undefined,
          postId: data.postId,
          commentId: data.commentId,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit report");

      toast.success("Raport trimis. Mulțumim!");
      onClose();
      setReason("");
      setDetails("");
    } catch {
      toast.error("Eroare la trimiterea raportului");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isReportModal} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Raportează conținut</DialogTitle>
          <DialogDescription className="text-slate-400">
            Selectează motivul pentru care raportezi acest conținut.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  reason === r
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Detalii suplimentare (opțional)..."
            className="bg-white/5 border-white/10 text-white min-h-[80px]"
          />
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-400"
          >
            Anulează
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason}
            className="bg-emergency hover:bg-emergency/90 gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Trimite Raport
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
