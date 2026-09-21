"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, type Variants } from "motion/react";
import {
  Brain,
  Check,
  FileText,
  Footprints,
  Hourglass,
  Lock,
  Plus,
  Sandwich,
  Timer,
  TrainFront,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { applyStoryNotifications } from "@/lib/notifications/story-reminders";
import type { StoryCommitment } from "@/lib/types/onboarding";
import { DAILY_TIME_OPTIONS } from "@/lib/types/onboarding";
import { useOnboardingStore } from "@/stores/onboarding-store";

const ACCENT = "#C8FF4D";

const RECLAIM_SLOTS = ["Subway Commute", "Lunch Break", "Evening Walk"];
const TRIGGER_TYPES = ["Deep Focus Sprint", "Recall Drill", "Mock Test"];

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const to12h = (t: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t ?? "");
  if (!m) return "--:--";
  const h = Number(m[1]);
  const min = Number(m[2]);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}${min === 0 ? "" : `:${String(min).padStart(2, "0")}`} ${suffix}`;
};

const empty24 = (v: string) => /^\d{1,2}:\d{2}$/.test(v ?? "");

/* ── Section card ── */

function StorySection({
  n,
  title,
  icon,
  children,
}: {
  n: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-white/[0.06] bg-gradient-to-b from-white/[0.045] to-white/[0.012] p-4 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]">
      <div className="mb-3.5 flex items-center gap-2">
        <span
          className="size-6 shrink-0 rounded-lg grid place-items-center"
          style={{ background: `${ACCENT}1c`, border: `1px solid ${ACCENT}26` }}
        >
          {icon}
        </span>
        <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground/70">{title}</span>
        <span className="h-px flex-1 bg-white/[0.06]" />
        <span className="text-[9px] font-black tracking-tight text-muted-foreground/30">{n}/03</span>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-bold tracking-[0.18em] uppercase text-muted-foreground/40">{children}</p>
  );
}

/* ── Spin-wheel time picker (drum drums: hours · minutes · AM/PM) ── */

const HOURS = Array.from({ length: 12 }, (_, i) => String(i === 0 ? 12 : i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
const AMPM = ["AM", "PM"];

function Drum({
  label,
  options,
  value,
  onSpin,
  muted,
  width,
}: {
  label: string;
  options: string[];
  value: string;
  onSpin: (next: string) => void;
  muted: boolean;
  width: string;
}) {
  const LEN = options.length;
  const idx = Math.max(0, options.indexOf(value));
  const spinBy = (off: number) =>
    onSpin(options[(((idx + off) % LEN) + LEN) % LEN]);

  const PITCH = 64;
  const tape = Array.from({ length: LEN * 3 }, (_, i) => options[i % LEN]);
  const tapeIdx = LEN + idx;

  const wheelRef = useRef(0);
  const dragRef = useRef<number | null>(null);
  const lastRef = useRef<{ y: number; t: number } | null>(null);
  const velRef = useRef(0);

  const onWheel = (e: React.WheelEvent) => {
    wheelRef.current += e.deltaY;
    let off = 0;
    while (Math.abs(wheelRef.current) >= 32) {
      off += Math.sign(wheelRef.current);
      wheelRef.current -= Math.sign(wheelRef.current) * 32;
    }
    if (off) spinBy(off);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = e.clientY;
    lastRef.current = { y: e.clientY, t: performance.now() };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragRef.current === null || !lastRef.current) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastRef.current.t);
    let dy = e.clientY - dragRef.current;
    let off = 0;
    while (Math.abs(dy) >= 44) {
      off += Math.sign(dy);
      dy -= Math.sign(dy) * 44;
    }
    if (off !== 0) {
      dragRef.current = e.clientY;
      velRef.current = dy / dt;
      spinBy(off);
    }
    lastRef.current = { y: e.clientY, t: now };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const v = velRef.current;
    dragRef.current = null;
    lastRef.current = null;
    velRef.current = 0;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (Math.abs(v) > 0.35) {
      const extra = Math.max(-4, Math.min(4, Math.round(v * 10)));
      if (extra !== 0) spinBy(extra);
    }
  };

  return (
    <div
      role="group"
      aria-label={`${label} — scroll up or down`}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={cn(
        "relative h-[64px] cursor-ns-resize select-none touch-none overflow-hidden",
        "[mask-image:linear-gradient(to_bottom,transparent,black_26%,black_74%,transparent)]",
        width,
      )}
    >
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0"
        animate={{ y: -tapeIdx * PITCH }}
        transition={{ type: "spring", stiffness: 320, damping: 34, mass: 0.5 }}
      >
        {tape.map((entry, i) => {
          const dist = Math.abs(i - tapeIdx);
          return (
            <div
              key={i}
              className={cn(
                "h-16 w-full flex items-center justify-center font-mono text-[20px] font-bold tabular-nums",
                dist === 0 ? "text-[#C8FF4D]" : dist <= 2 ? "text-muted-foreground/35" : "text-muted-foreground/20",
              )}
              style={dist === 0 && !muted ? { textShadow: "0 0 18px rgba(200,255,77,0.45)" } : undefined}
            >
              {entry}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

function TimeWheel({
  value24,
  onChange,
  label,
}: {
  value24: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const has = empty24(value24);
  const parts = has ? value24.split(":") : [];
  const h = has ? (Number(parts[0]) % 24) : 0;
  const m = has ? Number(parts[1]) : 0;
  const hour12 = String(h % 12 === 0 ? 12 : h % 12).padStart(2, "0");
  const minute = String(m).padStart(2, "0");
  const amp = h >= 12 ? "PM" : "AM";
  const emit = (h24: number, m24: number) =>
    onChange(`${String(((h24 % 24) + 24) % 24).padStart(2, "0")}:${String(m24).padStart(2, "0")}`);

  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center justify-center gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-2"
    >
      <Drum
        label={`${label} — hour`}
        options={HOURS}
        value={hour12}
        muted={false}
        width="w-11"
        onSpin={(v) => {
          const base = (Number(v) % 12) + (amp === "PM" ? 12 : 0);
          emit(base, m);
        }}
      />
      <motion.span
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className={cn("font-mono text-[20px] font-bold tabular-nums -mt-1", has ? "text-muted-foreground/60" : "text-muted-foreground/25")}
      >
        :
      </motion.span>
      <Drum
        label={`${label} — minutes`}
        options={MINUTES}
        value={minute}
        muted={false}
        width="w-11"
        onSpin={(v) => emit(h, Number(v))}
      />
      <Drum
        label={`${label} — period`}
        options={AMPM}
        value={amp}
        muted={false}
        width="w-10"
        onSpin={(v) => {
          const base = h % 12;
          emit(v === "PM" ? base + 12 : base, m);
        }}
      />
    </div>
  );
}

/* ── Shared pill + card selectors ── */

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      animate={{ scale: active ? 1.04 : 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 26 }}
      className={cn(
        "rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-colors duration-200",
        active
          ? "border-transparent text-[#0A0C0A]"
          : "border-white/[0.08] bg-white/[0.03] text-muted-foreground/60 hover:bg-white/[0.06] hover:text-muted-foreground/80",
      )}
      style={
        active
          ? { background: `linear-gradient(135deg, ${ACCENT}, #A9E93E)`, boxShadow: "0 4px 20px rgba(200,255,77,0.35)" }
          : undefined
      }
    >
      {children}
    </motion.button>
  );
}

function OptionCard({
  active,
  onClick,
  icon,
  iconActive,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  iconActive: React.ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      animate={{ scale: active ? 1.01 : 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all duration-200",
        active
          ? "border-[#C8FF4D]/55 bg-[#C8FF4D]/[0.06]"
          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]",
      )}
      style={
        active
          ? { boxShadow: "0 4px 28px rgba(200,255,77,0.13), 0 0 0 1px rgba(200,255,77,0.12) inset" }
          : undefined
      }
    >
      <div
        className="size-9 shrink-0 rounded-xl flex items-center justify-center transition-all duration-200"
        style={{
          background: active ? `${ACCENT}26` : "rgba(255,255,255,0.04)",
          border: `1px solid ${active ? `${ACCENT}33` : "rgba(255,255,255,0.05)"}`,
        }}
      >
        {active ? iconActive : icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-[13px] font-bold leading-tight", active ? "text-foreground" : "text-foreground/70")}>
          {label}
        </p>
        {sub && <p className="text-micro font-medium text-muted-foreground/50 mt-0.5">{sub}</p>}
      </div>
      <span
        className={cn(
          "size-5 shrink-0 rounded-full grid place-items-center transition-all duration-200",
          active ? "bg-[#C8FF4D] shadow-[0_0_14px_rgba(200,255,77,0.45)]" : "border border-white/[0.12] bg-white/[0.03]",
        )}
      >
        {active && <Check size={10} className="text-[#0A0C0A]" strokeWidth={3.5} />}
      </span>
    </motion.button>
  );
}

function SlotIcon({ slot, active }: { slot: string; active?: boolean }) {
  const cls = active ? "text-[#C8FF4D]" : "text-muted-foreground/70";
  return slot === "Subway Commute" ? (
    <TrainFront size={16} className={cls} />
  ) : slot === "Lunch Break" ? (
    <Sandwich size={16} className={cls} />
  ) : (
    <Footprints size={16} className={cls} />
  );
}

function TriggerIcon({ type, active }: { type: string; active?: boolean }) {
  const cls = active ? "text-[#C8FF4D]" : "text-muted-foreground/70";
  return type === "Deep Focus Sprint" ? (
    <Timer size={16} className={cls} />
  ) : type === "Recall Drill" ? (
    <Brain size={16} className={cls} />
  ) : (
    <FileText size={16} className={cls} />
  );
}

function triggerSub(type: string) {
  return type === "Deep Focus Sprint"
    ? "Undistracted timed sets"
    : type === "Recall Drill"
      ? "Active memory, no hints"
      : "Exam-style conditions";
}

/* ── Presentational: single-page commitment form (reused by AdaptiveReprompt) ── */

const parseWindow = (w: string) => {
  const [a, b] = (w || " - ").split(" - ");
  return { from: (a ?? "").trim(), to: (b ?? "").trim() };
};

export function StoryCommitmentMatrix({
  value,
  onChange,
}: {
  value: StoryCommitment;
  onChange: (patch: Partial<StoryCommitment>) => void;
}) {
  const toggleDay = (i: number) =>
    onChange({ weekDays: value.weekDays.map((v, idx) => (idx === i ? !v : v)) });

  const daysActive = value.weekDays.filter(Boolean).length;
  const weekLabel = daysActive === 7 ? "Every day" : `${daysActive} days/wk`;
  const win = parseWindow(value.reclaimWindow);

  return (
    <div className="flex flex-col gap-4">
      {/* 01 — Daily practice */}
      <StorySection n="01" title="Daily practice" icon={<Timer size={12} style={{ color: ACCENT }} />}>
        <GroupLabel>Minutes a day</GroupLabel>
        <div className="grid grid-cols-3 gap-2">
          {DAILY_TIME_OPTIONS.map((m) => (
            <Pill key={m} active={value.dailyMinutes === m} onClick={() => onChange({ dailyMinutes: m })}>
              {m} min
            </Pill>
          ))}
        </div>
        <GroupLabel>Remind me at</GroupLabel>
        <TimeWheel
          label="Reminder time"
          value24={value.reminderTime}
          onChange={(v) => onChange({ reminderTime: v })}
        />
      </StorySection>

      {/* 02 — Reclaim time */}
      <StorySection n="02" title="Reclaim time" icon={<Hourglass size={12} style={{ color: ACCENT }} />}>
        <GroupLabel>Where your prep hides</GroupLabel>
        <div className="flex flex-col gap-2">
          {RECLAIM_SLOTS.map((s) => (
            <OptionCard
              key={s}
              active={value.reclaimSlot === s}
              onClick={() => onChange({ reclaimSlot: s })}
              icon={<SlotIcon slot={s} />}
              iconActive={<SlotIcon slot={s} active />}
              label={s}
            />
          ))}
        </div>
        <GroupLabel>Window starts</GroupLabel>
        <TimeWheel
          label="Reclaim window start"
          value24={win.from}
          onChange={(v) => onChange({ reclaimWindow: `${v} - ${win.to || "00:00"}` })}
        />
        <GroupLabel>Window ends</GroupLabel>
        <TimeWheel
          label="Reclaim window end"
          value24={win.to}
          onChange={(v) => onChange({ reclaimWindow: `${win.from || "00:00"} - ${v}` })}
        />
      </StorySection>

      {/* 03 — Lock it in */}
      <StorySection n="03" title="Lock it in" icon={<Lock size={12} style={{ color: ACCENT }} />}>
        <GroupLabel>Trigger me with</GroupLabel>
        <div className="flex flex-col gap-2">
          {TRIGGER_TYPES.map((tr) => (
            <OptionCard
              key={tr}
              active={value.triggerType === tr}
              onClick={() => onChange({ triggerType: tr })}
              icon={<TriggerIcon type={tr} />}
              iconActive={<TriggerIcon type={tr} active />}
              label={tr}
              sub={triggerSub(tr)}
            />
          ))}
        </div>
        <GroupLabel>At this time</GroupLabel>
        <TimeWheel
          label="Trigger time"
          value24={value.triggerTime}
          onChange={(v) => onChange({ triggerTime: v })}
        />

        <GroupLabel>Consistency days</GroupLabel>
        <div className="flex justify-between gap-1">
          {DAY_LABELS.map((d, i) => {
            const active = value.weekDays[i];
            return (
              <motion.button
                key={`${d}-${i}`}
                type="button"
                onClick={() => toggleDay(i)}
                whileTap={{ scale: 0.82 }}
                animate={active ? { scale: [1, 1.14, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold transition-colors duration-200",
                  active ? "text-[#0A0C0A]" : "bg-white/[0.05] text-muted-foreground/40 hover:bg-white/[0.08]",
                )}
                style={active ? { background: ACCENT, boxShadow: "0 2px 12px rgba(200,255,77,0.4)" } : undefined}
              >
                {d}
              </motion.button>
            );
          })}
        </div>

        {/* Live commitment summary */}
        <div className="mt-1 flex items-center justify-center gap-3 overflow-hidden rounded-2xl border border-[#C8FF4D]/25 bg-[#C8FF4D]/[0.06] px-4 py-3">
          <Timer size={14} className="shrink-0 text-[#C8FF4D]" />
          <p className="truncate text-[11px] font-semibold text-muted-foreground/80">
            {value.dailyMinutes} min · {to12h(value.reminderTime)}
            <span className="text-[#C8FF4D]"> · {value.reclaimSlot}</span>
            <span className="text-muted-foreground/60"> · {weekLabel}</span>
          </p>
        </div>
      </StorySection>
    </div>
  );
}

/* ── Story hook overlay ── */

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

export function StoryHook({ onClose }: { onClose: () => void }) {
  const store = useOnboardingStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  const [value, setValue] = useState<StoryCommitment>(() => {
    const stored = store.weekDays;
    const week =
      stored && stored.length === 7 ? stored : Array.from({ length: 7 }, (_, i) => stored?.[i] ?? true);
    return {
      dailyMinutes: store.dailyMinutes ?? 30,
      reminderTime: store.reminderTime || "00:00",
      reclaimSlot: store.reclaimSlot,
      reclaimWindow: store.reclaimWindow || "00:00 - 00:00",
      triggerType: store.triggerType,
      triggerTime: store.triggerTime || "00:00",
      weekDays: week,
    };
  });

  useEffect(() => {
    if (overlayRef.current) {
      const el = overlayRef.current;
      el.animate([{ transform: "translateX(100%)" }, { transform: "translateX(0%)" }], {
        duration: 320,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
    }
  }, []);

  const persist = () => {
    store.setDailyMinutes(value.dailyMinutes);
    store.setReminderTime(value.reminderTime);
    store.setReclaimSlot(value.reclaimSlot);
    store.setReclaimWindow(value.reclaimWindow);
    store.setTriggerType(value.triggerType);
    store.setTriggerTime(value.triggerTime);
    store.setWeekDays(value.weekDays);
  };

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const closingRef = useRef(false);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    persist();
    void applyStoryNotifications(value);
    const done = () => onCloseRef.current();
    const el = overlayRef.current;
    if (!el) return done();
    el.animate([{ transform: "translateX(0%)" }, { transform: "translateX(-100%)" }], { duration: 280, easing: "cubic-bezier(0.55, 0, 0.55, 0.2)", fill: "forwards" }).addEventListener("finish", done, { once: true });
  }, [value, persist, store]);

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[70] overflow-hidden flex flex-col items-center px-6 py-10"
      style={{ background: "linear-gradient(180deg, rgba(10,12,10,0.98) 0%, rgba(14,17,13,0.98) 100%)" }}
      role="dialog"
      aria-modal="true"
    >
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[440px] h-[320px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #22D3EE3f, transparent 70%)" }} />
      <div className="pointer-events-none absolute bottom-[-140px] left-1/2 -translate-x-1/2 w-[360px] h-[280px] rounded-full opacity-[0.13]" style={{ background: `radial-gradient(circle, ${ACCENT}55, transparent 70%)` }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,255,77,0.35), transparent)" }} />

      <div className="relative w-full max-w-[340px] flex-1 flex flex-col min-h-0">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col flex-1 min-h-0"
        >
          {/* Dashboard-style pill badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C8FF4D] opacity-50" />
                <span className="relative inline-flex size-1.5 rounded-full bg-[#C8FF4D]" style={{ boxShadow: "0 0 8px rgba(200,255,77,0.8)" }} />
              </span>
              <span className="text-[11px] font-semibold tracking-[0.22em] text-[#C8FF4D]/85">
                TELL US YOUR STORY
              </span>
            </div>
          </motion.div>

          <motion.p variants={itemVariants} className="mb-4 text-center text-[12px] font-medium text-muted-foreground/50">
            Shape the plan around the life you already live.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex-1 min-h-0 overflow-y-auto pr-0.5 rounded-[20px]"
            style={{ scrollbarWidth: "none" }}
          >
            <StoryCommitmentMatrix
              value={value}
              onChange={(patch) => setValue((prev) => ({ ...prev, ...patch }))}
            />
          </motion.div>
        </motion.div>
      </div>

      <button
        type="button"
        onClick={close}
        className="absolute top-5 right-5 text-[12px] font-bold text-muted-foreground/40 transition-colors hover:text-foreground/70 active:scale-95"
      >
        Skip
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 280, damping: 28 }}
        className="relative w-full max-w-[340px] mt-6"
      >
        <button
          type="button"
          onClick={close}
          className="group relative flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 py-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#0A0C0A] transition-transform active:scale-[0.98]"
          style={{
            background: `linear-gradient(90deg, ${ACCENT}, #B9F45C)`,
            boxShadow: "0 10px 34px rgba(200,255,77,0.3), 0 1px 0 rgba(255,255,255,0.25) inset",
          }}
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/55 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
          <span className="relative flex items-center gap-2.5">
            <Plus size={14} strokeWidth={3} className="transition-transform duration-300 group-hover:rotate-90" />
            Lock it in
          </span>
        </button>
        <p className="mt-2.5 text-center text-[10px] font-medium text-muted-foreground/35">
          You can adjust all of this anytime in Settings.
        </p>
      </motion.div>
    </div>,
    document.body,
  );
}
