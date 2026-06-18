import { create } from "zustand";

type Modal = {
  type: "alert" | "confirm" | "none";
  title?: string;
  message?: string;
  onConfirm?: () => void;
};

type UiState = {
  modal: Modal;
  openModal: (modal: Omit<Modal, "type"> & { type: "alert" | "confirm" }) => void;
  closeModal: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  modal: { type: "none" },

  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: { type: "none" } }),
}));
