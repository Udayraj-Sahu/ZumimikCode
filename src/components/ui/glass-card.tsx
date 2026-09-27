"use client";

import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { GLASS_BG, GLASS_BORDER } from "@/lib/theme-tokens";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  radius?: "2xl" | "3xl";
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  { radius = "3xl", className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("relative border backdrop-blur-xl", radius === "3xl" ? "rounded-3xl" : "rounded-2xl", className)}
      style={{ borderColor: GLASS_BORDER, background: GLASS_BG, ...style }}
      {...props}
    />
  );
});