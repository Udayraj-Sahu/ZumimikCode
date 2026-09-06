import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeLocalStorage } from "@/lib/browser";

export type Theme = "dark" | "light" | "system";

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

function cycleTheme(theme: Theme): Theme {
  if (theme === "dark") return "light";
  if (theme === "light") return "dark";
  return "light";
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: cycleTheme(s.theme) })),
    }),
    {
      name: "exam-arena-theme",
      storage: createJSONStorage(() => safeLocalStorage),
    },
  ),
);
