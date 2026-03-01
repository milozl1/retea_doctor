"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ReportActionsProps {
  reportId: number;
}

export function ReportActions({ reportId }: ReportActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function handleAction(action: "resolved" | "dismissed") {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Eroare");
      }
      toast.success(action === "resolved" ? "Raport rezolvat" : "Raport respins");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Eroare la actualizare";
      toast.error(msg);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      <Button
        variant="ghost"
        size="sm"
        className="text-green-400 hover:text-green-300 hover:bg-green-500/10 gap-1.5 text-xs"
        disabled={loading !== null}
        onClick={() => handleAction("resolved")}
      >
        {loading === "resolved" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <CheckCircle className="h-3 w-3" />
        )}
        Rezolvă
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-slate-500 hover:text-slate-300 hover:bg-white/5 gap-1.5 text-xs"
        disabled={loading !== null}
        onClick={() => handleAction("dismissed")}
      >
        {loading === "dismissed" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <XCircle className="h-3 w-3" />
        )}
        Respinge
      </Button>
    </div>
  );
}
