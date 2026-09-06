"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/stores/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const [systemLight, setSystemLight] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    setSystemLight(mql.matches);
    const listener = (e: MediaQueryListEvent) => setSystemLight(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);

  const effectiveLight = theme === "system" ? systemLight : theme === "light";

  useEffect(() => {
    document.documentElement.classList.toggle("light", effectiveLight);
  }, [effectiveLight]);

  return <>{children}</>;
}