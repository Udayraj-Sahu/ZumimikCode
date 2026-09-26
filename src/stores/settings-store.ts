import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeLocalStorage } from "@/lib/browser";

type SettingsState = {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  setHapticEnabled: (v: boolean) => void;
  reset: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      hapticEnabled: true,
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setHapticEnabled: (hapticEnabled) => set({ hapticEnabled }),
      reset: () => set({ soundEnabled: true, hapticEnabled: true }),
    }),
    {
      name: "exam-arena-settings",
      storage: createJSONStorage(() => safeLocalStorage),
    },
  ),
);
