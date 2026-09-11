import { create } from "zustand";

export type PaywallAction = "prep" | "mock";

type PaywallStoreState = {
  open: boolean;
  action: PaywallAction | null;
  openPaywall: (action: PaywallAction) => void;
  closePaywall: () => void;
};

export const usePaywallStore = create<PaywallStoreState>((set) => ({
  open: false,
  action: null,
  openPaywall: (action) => set({ open: true, action }),
  closePaywall: () => set({ open: false, action: null }),
}));