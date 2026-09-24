"use client";

import { cn } from "@/lib/utils";

interface QuestionNavigatorProps {
  count: number;
  currentIndex: number;
  answered: boolean[];
  onSelect: (index: number) => void;
}

export function QuestionNavigator({ count, currentIndex, answered, onSelect }: QuestionNavigatorProps) {
  return (
    <div className="pt-5">
      <p className="mb-2 text-micro font-bold uppercase tracking-[0.18em] text-muted-foreground/40">
        Navigator
      </p>
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(40px, 1fr))" }}>
        {Array.from({ length: count }).map((_, i) => {
          const isCurrent = i === currentIndex;
          const isAnswered = !!answered[i];
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`Question ${i + 1}${isAnswered ? " (answered)" : isCurrent ? " (current)" : ""}`}
              className={cn(
                "grid size-9 place-items-center rounded-lg text-micro font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                isCurrent
                  ? "border border-primary bg-chrome-active text-primary"
                  : isAnswered
                    ? "bg-primary/20 text-primary"
                    : "border border-white/[0.06] bg-white/[0.02] text-muted-foreground/50 hover:text-muted-foreground",
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}