import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeLocalStorage } from "@/lib/browser";

type WalkthroughState = {
  completed: boolean;
  complete: () => void;
  reset: () => void;
};

export const useWalkthroughStore = create<WalkthroughState>()(
  persist(
    (set) => ({
      completed: false,
      complete: () => set({ completed: true }),
      reset: () => set({ completed: false }),
    }),
    {
      name: "exam-arena-walkthrough",
      storage: createJSONStorage(() => safeLocalStorage),
    },
  ),
);
