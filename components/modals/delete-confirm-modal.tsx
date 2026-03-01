"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/stores/modal-store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteConfirmModal() {
  const { isOpen, type, data, onClose } = useModal();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const isDeleteModal = isOpen && type === "deleteConfirm";

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (data.postId) {
        const res = await fetch(`/api/posts/${data.postId}`, { method: "DELETE" });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Eroare la ștergere");
        }
        toast.success("Postare ștearsă");
        onClose();
        router.push("/");
        router.refresh();
      } else if (data.commentId) {
        const res = await fetch(`/api/comments/${data.commentId}`, { method: "DELETE" });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Eroare la ștergere");
        }
        toast.success("Comentariu șters");
        onClose();
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Eroare la ștergere");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isDeleteModal} onOpenChange={onClose}>
      <DialogContent className="bg-[#0c1222] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Confirmare ștergere</DialogTitle>
          <DialogDescription className="text-slate-400">
            Ești sigur că vrei să ștergi? Această acțiune nu poate fi anulată.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-400"
            disabled={isDeleting}
          >
            Anulează
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Șterge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
