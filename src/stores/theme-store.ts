import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeLocalStorage } from "@/lib/browser";

export type Theme = "dark" | "light";

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  reset: () => void;
};

const STORAGE_KEY = "exam-arena-theme";

// `.light` is scoped to app-shell subtrees ([data-theme-scope]) so the landing
// page and onboarding/auth surfaces never flip. Everything outside those
// subtrees permanently resolves :root (dark) values.
function applyThemeClass(theme: Theme) {
  if (typeof document === "undefined") return;
  document.querySelectorAll<HTMLElement>("[data-theme-scope]").forEach((el) => {
    el.classList.toggle("light", theme === "light");
  });
}

function readInitialTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  try {
    const raw = safeLocalStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { state: { theme: Theme } };
      if (parsed?.state?.theme === "light") return "light";
    }
  } catch {
    /* ignore */
  }
  return "dark";
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: readInitialTheme(),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
      reset: () => set({ theme: "dark" }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => safeLocalStorage),
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeClass(state.theme);
      },
    },
  ),
);

useThemeStore.subscribe((state, prev) => {
  if (state.theme !== prev.theme) applyThemeClass(state.theme);
});