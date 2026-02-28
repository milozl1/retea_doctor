"use client";

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

interface DeleteConfirmModalProps {
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  onConfirm,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  const { isOpen, type, onClose } = useModal();

  const isDeleteModal = isOpen && type === "deleteConfirm";

  return (
    <Dialog open={isDeleteModal} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-white/10">
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
          >
            Anulează
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={isDeleting}
            className="bg-emergency hover:bg-emergency/90"
          >
            Șterge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
