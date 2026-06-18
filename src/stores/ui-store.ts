import { create } from "zustand";

type Modal = {
  type: "alert" | "confirm" | "none";
  title?: string;
  message?: string;
  onConfirm?: () => void;
};

type UiState = {
  sidebarOpen: boolean;
  modal: Modal;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  openModal: (modal: Omit<Modal, "type"> & { type: "alert" | "confirm" }) => void;
  closeModal: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  modal: { type: "none" },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: { type: "none" } }),
}));
