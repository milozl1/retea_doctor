"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/stores/modal-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  onDeleted?: () => void;
}

export function DeleteConfirmModal({ onDeleted }: DeleteConfirmModalProps) {
  const { isDeleteModalOpen, deleteTarget, closeDeleteModal } = useModalStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);

    try {
      const url =
        deleteTarget.type === "post"
          ? `/api/posts/${deleteTarget.id}`
          : `/api/comments/${deleteTarget.id}`;

      const response = await fetch(url, { method: "DELETE" });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? "Eroare la ștergere");
      }

      toast.success(
        deleteTarget.type === "post"
          ? "Postarea a fost ștearsă"
          : "Comentariul a fost șters"
      );

      closeDeleteModal();
      onDeleted?.();

      // Navigate away if deleting a post
      if (deleteTarget.type === "post") {
        router.push("/");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Eroare la ștergere"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const isPost = deleteTarget?.type === "post";

  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={closeDeleteModal}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <Trash2 className="h-5 w-5" />
            Confirmă ștergerea
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p className="text-slate-400 text-sm">
            Ești sigur că vrei să ștergi{" "}
            <span className="text-white font-medium">
              {isPost ? "această postare" : "acest comentariu"}
            </span>
            ? Acțiunea nu poate fi anulată.
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={closeDeleteModal}
              disabled={isDeleting}
              className="text-slate-400 hover:text-white"
            >
              Anulează
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Se șterge..." : "Șterge"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
