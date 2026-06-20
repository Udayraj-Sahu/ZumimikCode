import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage),
      ),
    },
  ),
);
