"use client";

import { useThemeStore } from "@/stores/theme-store";
import { accentThemes } from "@/lib/theme-tokens";

/**
 * Resolved hex for the active accent in the active mode.
 *
 * Needed wherever a color must be manipulated in JS -- hex alpha concatenation
 * (`${accent}1a`) and channel math (shade()) -- because those cannot be done
 * with `var(--primary)`. Prefer the CSS custom properties wherever possible;
 * reach for this only when the value has to reach JavaScript.
 */
export function useAccentHex(): string {
  const theme = useThemeStore((s) => s.theme);
  const accent = useThemeStore((s) => s.accent);
  return accentThemes[accent][theme].primary;
}
