import { create } from "zustand";

interface ModalStore {
  isReportModalOpen: boolean;
  reportPostId: number | null;
  reportCommentId: number | null;
  openReportModal: (postId?: number, commentId?: number) => void;
  closeReportModal: () => void;

  isDeleteModalOpen: boolean;
  deleteTarget: { type: "post" | "comment"; id: number } | null;
  openDeleteModal: (type: "post" | "comment", id: number) => void;
  closeDeleteModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isReportModalOpen: false,
  reportPostId: null,
  reportCommentId: null,
  openReportModal: (postId, commentId) =>
    set({
      isReportModalOpen: true,
      reportPostId: postId ?? null,
      reportCommentId: commentId ?? null,
    }),
  closeReportModal: () =>
    set({
      isReportModalOpen: false,
      reportPostId: null,
      reportCommentId: null,
    }),

  isDeleteModalOpen: false,
  deleteTarget: null,
  openDeleteModal: (type, id) =>
    set({ isDeleteModalOpen: true, deleteTarget: { type, id } }),
  closeDeleteModal: () =>
    set({ isDeleteModalOpen: false, deleteTarget: null }),
}));
