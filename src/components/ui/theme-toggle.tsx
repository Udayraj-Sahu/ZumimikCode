"use client";

import { SVGProps, useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import type { Transition, Variants } from "motion/react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/theme-store";

type ToggleSize = "default" | "lg" | "xl";

const Moon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("text-white dark:text-white", props.className)}
    >
      <path
        fillRule="evenodd"
        d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const Sun = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="#F59E0B"
    >
      <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
    </svg>
  );
};

// Three positions: Light (left), Dark (middle), Study (right). Each track is
// exactly three knobs wide, so `step` (the knob width) is the distance the knob
// travels per position.
const toggleSizeMap = {
  default: {
    container: "w-[72px] h-6",
    checkbox: "w-6 h-6",
    icon: "w-3 h-3",
    step: 24,
  },
  lg: {
    container: "w-24 h-8",
    checkbox: "w-8 h-8",
    icon: "w-4 h-4",
    step: 32,
  },
  xl: {
    container: "w-36 h-12",
    checkbox: "w-12 h-12",
    icon: "w-6 h-6",
    step: 48,
  },
};

const toggleVariants = {
  light: () => ({
    x: 0,
  }),
  dark: (step: number) => ({
    x: step,
  }),
  study: (step: number) => ({
    x: step * 2,
  }),
} satisfies Variants;

const sunVariants = {
  light: {
    y: "0%",
    x: "0%",
    opacity: 1,
  },
  dark: {
    y: "-100%",
    x: "100%",
    opacity: 0,
  },
  study: {
    y: "-100%",
    x: "100%",
    opacity: 0,
  },
} satisfies Variants;

const moonVariants = {
  light: {
    y: "-100%",
    x: "-100%",
    opacity: 0,
  },
  dark: {
    y: "0%",
    x: "0%",
    opacity: 1,
  },
  study: {
    y: "-100%",
    x: "100%",
    opacity: 0,
  },
} satisfies Variants;

// BookOpen (lucide) is the Study Mode position. Study Mode is UI-only for now:
// selecting it parks the toggle on the right with this icon but applies no
// light/dark/accent tokens, so its treatment intentionally mirrors dark.
const bookVariants = {
  light: {
    y: "-100%",
    x: "-100%",
    opacity: 0,
  },
  dark: {
    y: "-100%",
    x: "-100%",
    opacity: 0,
  },
  study: {
    y: "0%",
    x: "0%",
    opacity: 1,
  },
} satisfies Variants;

const springTransition = {
  type: "spring",
  stiffness: 100,
  damping: 30,
} satisfies Transition;

const useMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

export function ThemeToggle({
  size = "default",
  className,
}: {
  size?: ToggleSize;
  className?: string;
}) {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [isStudy, setIsStudy] = useState(false);
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  // Study Mode is UI-only for now: a third selectable position in the toggle
  // that applies no tokens (the store's Theme axis stays "light" | "dark").
  // Selecting it parks the knob on the right with the BookOpen icon until the
  // full Study Mode behavior lands.
  const mode: "light" | "dark" | "study" = isStudy ? "study" : theme;
  const isLight = mode === "light";
  const selectedSize = toggleSizeMap[size];

  const selectNextMode = () => {
    if (isStudy) {
      setIsStudy(false);
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setIsStudy(true);
    }
  };

  const ariaLabel =
    mode === "light"
      ? "Switch to dark theme"
      : mode === "dark"
        ? "Switch to Study Mode"
        : "Switch to light theme";

  return (
    <button
      type="button"
      aria-pressed={mode === "dark"}
      aria-label={ariaLabel}
      onClick={selectNextMode}
      className={cn(
        "relative inline-flex min-h-11 min-w-11 shrink-0 appearance-none items-center justify-center rounded-full border-0 p-0 align-middle leading-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <span
        className={cn(
          "relative inline-flex items-center justify-start overflow-hidden rounded-full",
          selectedSize.container,
          isLight ? "bg-gray-200" : "bg-gray-800",
        )}
      >
        <motion.div
          className={cn(
            selectedSize.checkbox,
            "absolute top-0 left-0 rounded-full flex items-center justify-center overflow-hidden",
            isLight
              ? "keep-white bg-white shadow-lg shadow-white/50"
              : "bg-black shadow-lg shadow-black/50",
          )}
          animate={mode}
          variants={toggleVariants}
          custom={selectedSize.step}
          transition={springTransition}
        >
          <motion.div
            className="absolute"
            initial="light"
            animate={mode}
            variants={sunVariants}
            transition={springTransition}
          >
            <Sun className={selectedSize.icon} />
          </motion.div>
          <motion.div
            className="absolute"
            initial="light"
            animate={mode}
            variants={moonVariants}
            transition={springTransition}
          >
            <Moon className={cn(selectedSize.icon)} />
          </motion.div>
          <motion.div
            className="absolute"
            initial="light"
            animate={mode}
            variants={bookVariants}
            transition={springTransition}
          >
            <BookOpen className={cn(selectedSize.icon, "text-white")} />
          </motion.div>
        </motion.div>
      </span>
    </button>
  );
}
