"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { X, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Props = {
  open: boolean;
  initialValue?: string; // ISO date "YYYY-MM-DD" or undefined
  onConfirm: (date: string) => void;
  onClose: () => void;
};

function dayCount(month: string, year: number): number {
  const idx = MONTHS.indexOf(month);
  return new Date(year, idx + 1, 0).getDate();
}

export function ExamDateModal({ open, initialValue, onConfirm, onClose }: Props) {
  const [selected, setSelected] = useState(() => {
    const d = initialValue ? new Date(initialValue) : new Date(Date.now() + 90 * 86400000);
    return {
      day: String(d.getDate()),
      month: MONTHS[d.getMonth()],
      year: String(d.getFullYear()),
    };
  });
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const d = initialValue ? new Date(initialValue) : new Date(Date.now() + 90 * 86400000);
    setSelected({
      day: String(d.getDate()),
      month: MONTHS[d.getMonth()],
      year: String(d.getFullYear()),
    });
  }, [open, initialValue]);

  useEffect(() => {
    if (!open) return;
    if (overlayRef.current && dialogRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(dialogRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
    }
  }, [open]);

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => String(now + i));
  }, []);

  const days = useMemo(() => {
    // Keep the selected day within the valid range for the chosen month
    return Array.from({ length: dayCount(selected.month, Number(selected.year)) }, (_, i) => String(i + 1));
  }, [selected.month, selected.year]);

  // If the selected day is out of range (e.g. Feb 31), snap it to the month's last day
  useEffect(() => {
    if (!open) return;
    const max = dayCount(selected.month, Number(selected.year));
    if (Number(selected.day) > max) {
      setSelected((s) => ({ ...s, day: String(max) }));
    }
  }, [selected.month, selected.year, open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const handleConfirm = () => {
    const iso = `${selected.year}-${String(MONTHS.indexOf(selected.month) + 1).padStart(2, "0")}-${String(Number(selected.day)).padStart(2, "0")}`;
    const picked = new Date(Number(selected.year), MONTHS.indexOf(selected.month), Number(selected.day));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (picked.getTime() <= today.getTime()) {
      setError("Pick a future date — your exam date must be after today.");
      return;
    }
    setError(null);
    onConfirm(iso);
    onClose();
  };

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Set exam date"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl border border-border/60 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm px-5 pt-5 pb-3 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-primary" />
            <h2 className="text-fluid-base font-bold text-foreground">Set exam date</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground/50 hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-fluid-xs text-muted-foreground/60 mb-4 text-center">
            Select your target exam date to unlock the countdown
          </p>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="flex">
              <ScrollColumn
                items={days.map((d) => ({ value: d, label: d }))}
                selected={selected.day}
                onSelect={(v) => { setSelected((s) => ({ ...s, day: v })); setError(null); }}
                label="DD"
              />
              <div className="w-px bg-white/[0.06] my-3" />
              <ScrollColumn
                items={MONTHS.map((m) => ({ value: m, label: m.slice(0, 3) }))}
                selected={selected.month}
                onSelect={(v) => { setSelected((s) => ({ ...s, month: v })); setError(null); }}
                label="MM"
              />
              <div className="w-px bg-white/[0.06] my-3" />
              <ScrollColumn
                items={years.map((y) => ({ value: y, label: y }))}
                selected={selected.year}
                onSelect={(v) => { setSelected((s) => ({ ...s, year: v })); setError(null); }}
                label="YYYY"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-fluid-sm font-bold text-primary">
            {selected.month.slice(0, 3)} {selected.day}, {selected.year}
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3">
              <AlertCircle size={15} className="shrink-0 text-destructive" />
              <span className="text-fluid-xs font-semibold text-destructive">{error}</span>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm px-5 pb-5 pt-3 border-t border-border/40 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-border/60 bg-background py-3.5 text-fluid-sm font-bold text-foreground/80 outline-none transition-all hover:bg-accent/40 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-2xl bg-primary py-3.5 text-fluid-sm font-bold text-primary-foreground outline-none transition-all hover:opacity-90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
          >
            Set date
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ScrollColumn({
  items,
  selected,
  onSelect,
  label,
}: {
  items: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
  label: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEM_H = 36;
  const VISIBLE = 3;
  const PAD = Math.floor(VISIBLE / 2);

  useEffect(() => {
    if (!containerRef.current) return;
    const idx = items.findIndex((i) => i.value === selected);
    if (idx >= 0) {
      containerRef.current.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
    }
  }, [selected, items]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const idx = Math.round(scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    if (items[clamped]?.value !== selected) {
      onSelect(items[clamped].value);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <p className="text-center text-[9px] font-bold tracking-[0.14em] text-muted-foreground/25 pt-2 pb-1">
        {label}
      </p>
      <div className="relative" style={{ height: ITEM_H * VISIBLE }}>
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
        <div
          className="absolute left-1 right-1 h-10 rounded-xl border z-0 pointer-events-none"
          style={{ top: PAD * ITEM_H, background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}
        />
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll snap-y snap-mandatory"
          style={{ scrollBehavior: "smooth" }}
        >
          <div style={{ height: PAD * ITEM_H }} />
          {items.map((item) => {
            const isActive = item.value === selected;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  onSelect(item.value);
                  const idx = items.findIndex((i) => i.value === item.value);
                  containerRef.current?.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
                }}
                className={cn(
                  "w-full flex items-center justify-center snap-center transition-all duration-200",
                  isActive ? "text-foreground font-bold text-[15px]" : "text-muted-foreground/30 text-[13px] font-medium",
                )}
                style={{ height: ITEM_H }}
              >
                {item.label}
              </button>
            );
          })}
          <div style={{ height: PAD * ITEM_H }} />
        </div>
      </div>
    </div>
  );
}
