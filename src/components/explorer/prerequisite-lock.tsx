"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrerequisiteLockProps {
  label?: string;
  className?: string;
}

export default function PrerequisiteLock({ label, className }: PrerequisiteLockProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex cursor-not-allowed flex-col items-center justify-center rounded-lg bg-card/80 backdrop-blur-[1px]",
        className,
      )}
    >
      <Lock size={16} className="text-muted-foreground/50 mb-1" />
      {label && (
        <p className="text-fluid-xs font-semibold text-muted-foreground/60 text-center px-2 leading-tight">
          {label}
        </p>
      )}
    </div>
  );
}
