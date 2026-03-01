"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pin, Lock, Trash2, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AdminPostActionsProps {
  postId: number;
  isPinned: boolean;
  isLocked: boolean;
  isDeleted: boolean;
}

export function AdminPostActions({
  postId,
  isPinned,
  isLocked,
  isDeleted,
}: AdminPostActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(action: "pin" | "lock" | "delete" | "restore") {
    setLoading(action);
    try {
      const updates: Record<string, unknown> = {};
      switch (action) {
        case "pin":
          updates.isPinned = !isPinned;
          break;
        case "lock":
          updates.isLocked = !isLocked;
          break;
        case "delete":
          updates.isDeleted = true;
          break;
        case "restore":
          updates.isDeleted = false;
          break;
      }

      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Eroare");
      }

      toast.success(
        action === "pin"
          ? isPinned
            ? "Postare de-fixată"
            : "Postare fixată"
          : action === "lock"
          ? isLocked
            ? "Postare deblocată"
            : "Postare blocată"
          : action === "delete"
          ? "Postare ștearsă"
          : "Postare restaurată"
      );
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Eroare la acțiune"
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 w-7 p-0 ${isPinned ? "text-amber-400" : "text-slate-600 hover:text-amber-400"}`}
        onClick={() => handleAction("pin")}
        disabled={!!loading}
        title={isPinned ? "De-fixează" : "Fixează"}
      >
        {loading === "pin" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pin className="h-3 w-3" />}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 w-7 p-0 ${isLocked ? "text-red-400" : "text-slate-600 hover:text-red-400"}`}
        onClick={() => handleAction("lock")}
        disabled={!!loading}
        title={isLocked ? "Deblochează" : "Blochează"}
      >
        {loading === "lock" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3" />}
      </Button>
      {isDeleted ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-emerald-500 hover:text-emerald-400"
          onClick={() => handleAction("restore")}
          disabled={!!loading}
          title="Restaurează"
        >
          {loading === "restore" ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-slate-600 hover:text-red-500"
          onClick={() => handleAction("delete")}
          disabled={!!loading}
          title="Șterge"
        >
          {loading === "delete" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
        </Button>
      )}
    </div>
  );
}
