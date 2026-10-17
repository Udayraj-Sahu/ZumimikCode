import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

// Replace framer-motion with inert divs: transitions never run, so the cycle is
// deterministic and driven purely by the store + local study flag.
vi.mock("motion/react", () => {
  type MotionProps = Record<string, unknown> & { children?: React.ReactNode };
  const MotionDiv = ({ children, className, style, ...rest }: MotionProps) => {
    const domProps: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (key.startsWith("data-") || key.startsWith("aria-")) domProps[key] = value;
    }
    return (
      <div className={className as string} style={style as React.CSSProperties} {...domProps}>
        {children}
      </div>
    );
  };
  return { motion: { div: MotionDiv } };
});

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useThemeStore } from "@/stores/theme-store";

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.getState().reset();
  });

  it("cycles Light -> Dark -> Study -> Light and labels every position", () => {
    useThemeStore.getState().setTheme("light");
    render(<ThemeToggle />);

    // Light (left)
    const toDark = screen.getByRole("button", { name: "Switch to dark theme" });
    expect(toDark).toHaveAttribute("aria-pressed", "false");

    // -> Dark (middle)
    fireEvent.click(toDark);
    expect(useThemeStore.getState().theme).toBe("dark");
    const toStudy = screen.getByRole("button", { name: "Switch to Study Mode" });
    expect(toStudy).toHaveAttribute("aria-pressed", "true");

    // -> Study (right): UI-only, so the theme axis must NOT change.
    fireEvent.click(toStudy);
    expect(useThemeStore.getState().theme).toBe("dark");
    const toLight = screen.getByRole("button", { name: "Switch to light theme" });

    // -> Light again
    fireEvent.click(toLight);
    expect(useThemeStore.getState().theme).toBe("light");
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument();
  });

  it("offers Study Mode from a dark store without mutating the theme", () => {
    useThemeStore.getState().setTheme("dark");
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: "Switch to Study Mode" }));

    expect(useThemeStore.getState().theme).toBe("dark");
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeInTheDocument();
  });

  it("returns to dark, not study, when leaving Study Mode from a dark base", () => {
    useThemeStore.getState().setTheme("light");
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: "Switch to dark theme" }));
    fireEvent.click(screen.getByRole("button", { name: "Switch to Study Mode" }));
    expect(useThemeStore.getState().theme).toBe("dark");

    // Study -> Light -> Dark restores the light/dark axis cleanly.
    fireEvent.click(screen.getByRole("button", { name: "Switch to light theme" }));
    expect(useThemeStore.getState().theme).toBe("light");
    fireEvent.click(screen.getByRole("button", { name: "Switch to dark theme" }));
    expect(useThemeStore.getState().theme).toBe("dark");
  });
});
