import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeLocalStorage } from "@/lib/browser";
import type { HistoryEntry } from "@/lib/types/history";

const MAX_ENTRIES = 200;

type ActivityState = {
  entries: HistoryEntry[];
  addEntry: (entry: HistoryEntry) => void;
  reset: () => void;
};

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      entries: [],

      addEntry: (entry) =>
        set((s) => {
          const next = [entry, ...s.entries];
          return { entries: next.length > MAX_ENTRIES ? next.slice(0, MAX_ENTRIES) : next };
        }),

      reset: () => set({ entries: [] }),
    }),
    {
      name: "exam-arena-activity",
      storage: createJSONStorage(() => safeLocalStorage),
    },
  ),
);
