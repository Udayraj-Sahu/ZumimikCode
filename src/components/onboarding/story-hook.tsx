"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, type Variants } from "motion/react";
import {
  Brain,
  Check,
  Footprints,
  Hourglass,
  Layers,
  Lock,
  Minus,
  Plus,
  Sandwich,
  Sigma,
  Sparkles,
  Timer,
  TrainFront,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { applyStoryNotifications } from "@/lib/notifications/story-reminders";
import type { StoryCommitment } from "@/lib/types/onboarding";
import { DAILY_TIME_OPTIONS } from "@/lib/types/onboarding";
import { useOnboardingStore } from "@/stores/onboarding-store";

const ACCENT = "#C8FF4D";

type Tone = "lime" | "cyan" | "fuchsia";

const toneChip: Record<Tone, string> = {
  lime: "border-[#C8FF4D]/50 bg-[#C8FF4D]/10 text-[#C8FF4D]",
  cyan: "border-cyan-400/50 bg-cyan-400/10 text-cyan-400",
  fuchsia: "border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-400",
};

const toneText: Record<Tone, string> = {
  lime: "text-[#C8FF4D]",
  cyan: "text-cyan-400",
  fuchsia: "text-fuchsia-400",
};

const RECLAIM_MODULES: { id: string; icon: typeof TrainFront; tone: Tone; slotMin: number; sub: string }[] = [
  { id: "Subway Commute", icon: TrainFront, tone: "lime", slotMin: 10, sub: "Morning & return leg" },
  { id: "Lunch Break", icon: Sandwich, tone: "cyan", slotMin: 15, sub: "Midday refuel" },
  { id: "Evening Walk", icon: Footprints, tone: "fuchsia", slotMin: 20, sub: "Cool-down laps" },
];

const TRIGGER_TYPES = ["Deep Focus Sprint", "Recall Drill", "Mock Test"];

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const YEARLY_GOAL_HOURS = 350;

const TIME_OPTIONS = (() => {
  const out: string[] = [];
  for (let m = 0; m < 1440; m += 15) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return out;
})();

const to12h = (t: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t ?? "");
  if (!m) return "--:--";
  const h = Number(m[1]);
  const min = Number(m[2]);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}${min === 0 ? "" : `:${String(min).padStart(2, "0")}`} ${suffix}`;
};

const parseWindow = (w: string) => {
  const [a, b] = (w || " - ").split(" - ");
  return { from: (a ?? "").trim(), to: (b ?? "").trim() };
};

const safeDays = (v?: boolean[]) =>
  v && v.length === 7 ? v : Array.from({ length: 7 }, () => true);

function cadenceLabel(days: boolean[]) {
  const n = days.filter(Boolean).length;
  if (n === 0) return "Paused";
  if (n === 7) return "Daily (7/7)";
  if (days.slice(0, 5).every(Boolean) && !days[5] && !days[6]) return "Weekdays";
  if (days[5] && days[6] && days.slice(0, 5).every((d) => !d)) return "Weekends";
  return `${n}/7 days`;
}

const timeWith = (v: string) =>
  TIME_OPTIONS.includes(v) ? TIME_OPTIONS : [...TIME_OPTIONS, v].sort((a, b) => a.localeCompare(b));

function weekdayLabel(weeklyMin: number) {
  if (weeklyMin >= 60) {
    const h = (weeklyMin / 60).toFixed(1).replace(/\.0$/, "");
    return `~${h} hrs / week`;
  }
  return `${weeklyMin} min / week`;
}

/* ── Tween for the hero counter ── */

function useTween(target: number, ms = 450) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      from.current = target;
      setValue(target);
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = a + (target - a) * eased;
      from.current = cur;
      setValue(cur);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

/* ── Shared bits ── */

function SectionHead({ icon, title, right }: { icon: React.ReactNode; title: string; right?: string }) {
  return (
    <div className="mt-7 flex items-center justify-between gap-2">
      <h2 className="font-mono flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        <span className="flex-none [&>svg]:size-[12px] [&>svg]:text-[#C8FF4D]">{icon}</span>
        {title}
      </h2>
      {right && <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-400">{right}</p>}
    </div>
  );
}

function Dot({ color = ACCENT, pulse, small }: { color?: string; pulse?: boolean; small?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block flex-none rounded-full", small ? "size-[5px]" : "size-[6px]", pulse && "animate-pulse")}
      style={{ background: color, boxShadow: `0 0 8px ${color}` }}
    />
  );
}

function Sel({
  value,
  onChange,
  label,
  flex,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  flex?: boolean;
}) {
  const options = timeWith(value);
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "min-w-0 cursor-pointer rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-[7px] font-mono text-[10px] font-medium text-foreground outline-none appearance-none",
        flex && "flex-1 basis-[104px]",
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%237c8883' stroke-width='1.5'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 7px center",
      }}
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-[#0b0d0c] text-foreground">
          {to12h(o)}
        </option>
      ))}
    </select>
  );
}

function Stepper({
  value,
  options,
  onSpin,
  label,
  unit,
  tone,
}: {
  value: number;
  options: number[];
  onSpin: (v: number) => void;
  label: string;
  unit: string;
  tone: Tone;
}) {
  const idx = Math.max(0, options.indexOf(value));
  return (
    <div role="group" aria-label={label} className="flex flex-none items-center gap-[6px] rounded-full border border-white/[0.08] bg-black/40 p-[4px]">
      <button
        type="button"
        aria-label={`Reduce ${label}`}
        disabled={idx <= 0}
        onClick={() => onSpin(options[idx - 1])}
        className="grid size-6 place-items-center rounded-full bg-white/[0.06] text-muted-foreground transition-opacity disabled:opacity-35"
      >
        <Minus size={12} strokeWidth={3} />
      </button>
      <span className="flex min-w-[44px] flex-col items-center font-mono font-bold leading-[1.15] text-foreground tabular-nums">
        <span className="text-[11px]">{value}</span>
        <i className="text-[8px] font-medium not-italic text-muted-foreground/60">{unit}</i>
      </span>
      <button
        type="button"
        aria-label={`Raise ${label}`}
        disabled={idx >= options.length - 1}
        onClick={() => onSpin(options[idx + 1])}
        className={cn("grid size-6 place-items-center rounded-full text-[#0A0C0A] transition-opacity disabled:opacity-35", tone === "lime" ? "bg-[#C8FF4D]" : tone === "cyan" ? "bg-cyan-400" : "bg-fuchsia-400")}
      >
        <Plus size={12} strokeWidth={3} />
      </button>
    </div>
  );
}

function DayButtons({ days, onChange, tone }: { days: boolean[]; onChange: (i: number) => void; tone: Tone }) {
  const onBg = tone === "lime" ? "#C8FF4D" : tone === "cyan" ? "#22D3EE" : "#E879F9";
  return (
    <div role="group" aria-label="Active days" className="flex gap-[4px]">
      {DAY_LABELS.map((d, i) => (
        <button
          key={`${d}-${i}`}
          type="button"
          aria-pressed={!!days[i]}
          aria-label={`Day ${d} ${i + 1}`}
          onClick={() => onChange(i)}
          className="size-[22px] rounded-[6px] border-0 font-mono text-[9.5px] font-bold leading-none transition-colors"
          style={
            days[i]
              ? { background: onBg, color: "#051005", boxShadow: `0 0 12px ${onBg}66` }
              : { background: "rgba(255,255,255,0.06)", color: "rgb(120 130 125)" }
          }
        >
          {d}
        </button>
      ))}
    </div>
  );
}

/* ── Reclaim module card ── */

function ReclaimModule({
  id,
  icon: Icon,
  tone,
  slotMin,
  sub,
  active,
  value,
  onChange,
}: {
  id: string;
  icon: typeof TrainFront;
  tone: Tone;
  slotMin: number;
  sub: string;
  active: boolean;
  value: StoryCommitment;
  onChange: (patch: Partial<StoryCommitment>) => void;
}) {
  const win = parseWindow(value.reclaimWindow);
  const days = safeDays(value.weekDays);
  const cadence = cadenceLabel(days);

  return (
    <article
      className={cn(
        "rounded-2xl border p-3.5 transition-all duration-200",
        active ? "border-[#C8FF4D]/55 bg-[#C8FF4D]/[0.06]" : "border-white/[0.06] bg-white/[0.02] opacity-70 hover:opacity-90",
      )}
      onClick={() => onChange({ reclaimSlot: id })}
    >
      <div className="flex items-center gap-3">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-full border", toneChip[tone])}>
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-semibold leading-tight text-foreground">{id}</h3>
          <p className="mt-0.5 text-[9px] font-medium text-muted-foreground/60">
            {slotMin} min/slot · {slotMin} min reclaimed
          </p>
        </div>
        <span
          className={cn(
            "grid size-5 shrink-0 place-items-center rounded-full border transition-all",
            active ? "bg-[#C8FF4D] text-[#0A0C0A] shadow-[0_0_12px_rgba(200,255,77,0.5)]" : "border-white/[0.12] bg-white/[0.03] text-[#C8FF4D]/50",
          )}
        >
          {active && <Check size={10} strokeWidth={3.5} />}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex flex-none items-center font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/60">
          Window:
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-[6px]">
          <Sel
            label={`${id} window start`}
            value={win.from}
            onChange={(v) => onChange({ reclaimWindow: `${v} - ${win.to || "00:00"}` })}
            flex
          />
          <Sel
            label={`${id} window end`}
            value={win.to}
            onChange={(v) => onChange({ reclaimWindow: `${win.from || "00:00"} - ${v}` })}
            flex
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
        <span className="inline-flex flex-none items-center font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/60">
          Cadence:
        </span>
        <DayButtons days={days} onChange={(i) => onChange({ weekDays: days.map((v, j) => (j === i ? !v : v)) })} tone={tone} />
        <span className={cn("ml-auto whitespace-nowrap text-right font-mono text-[10px] font-bold", toneText[tone])}>
          {cadence}
        </span>
      </div>
    </article>
  );
}

/* ── Presentational: single-page commitment form (used by StoryHook & AdaptiveReprompt) ── */

export function StoryCommitmentMatrix({
  value,
  onChange,
}: {
  value: StoryCommitment;
  onChange: (patch: Partial<StoryCommitment>) => void;
}) {
  const days = safeDays(value.weekDays);
  const daysActive = days.filter(Boolean).length;
  const mins = value.dailyMinutes ?? 30;
  const weeklyMin = mins * daysActive;
  const annualHours = (weeklyMin * 52) / 60;
  const weeklyHours = weeklyMin / 60;
  const sprints = Math.max(1, Math.floor(mins / 15));
  const pct = Math.min(100, (annualHours / YEARLY_GOAL_HOURS) * 100);

  const shownHours = Math.round(useTween(annualHours));
  const shownPct = useTween(pct);

  return (
    <div className="flex flex-col">
      {/* Hero — annual time reclaimed */}
      <section aria-label="Annual time reclaimed" className="mt-3 rounded-2xl border border-[#C8FF4D]/20 bg-white/[0.03] p-4">
        <div className="flex items-start justify-between gap-[10px]">
          <span className="font-mono flex items-start gap-2 text-[9px] font-medium uppercase leading-[1.45] tracking-[0.14em] text-muted-foreground">
            <Hourglass size={13} className="mt-px flex-none text-[#C8FF4D]" />
            <span>
              Annual time
              <br />
              reclaimed
            </span>
          </span>
          <span className="inline-flex flex-none items-center gap-[6px] rounded-full border border-[#C8FF4D]/30 bg-[#C8FF4D]/[0.08] px-2.5 py-1.5 text-[8.5px] font-bold uppercase leading-[1.4] tracking-[0.12em] text-[#C8FF4D]">
            <Zap size={11} />
            <span>
              Speed booster
              <br />
              +{Math.min(60, Math.round((mins / 30) * 25))}%
            </span>
          </span>
        </div>

        <p className="my-2 flex items-baseline gap-2 whitespace-nowrap" aria-live="polite">
          <b className="text-[clamp(22px,7vw,28px)] font-bold leading-none tracking-[-0.02em] text-[#C8FF4D] tabular-nums" style={{ textShadow: "0 0 18px rgba(200,255,77,0.35)" }}>
            +{shownHours} HOURS
          </b>
          <small className="font-mono text-[11px] font-semibold tracking-[0.1em] text-foreground/80">/ YEAR</small>
        </p>

        <div className="flex items-center justify-between gap-2 font-mono text-[10px] leading-[1.4]">
          <span className="text-cyan-400">
            <Dot color="#22D3EE" small /> +{weeklyHours.toFixed(2)} hrs/week converted
          </span>
          <span className="text-muted-foreground/60">Compounding daily</span>
        </div>

        <div
          className="mt-2 h-[6px] overflow-hidden rounded-full bg-white/[0.08]"
          role="progressbar"
          aria-label={`Progress toward ${YEARLY_GOAL_HOURS} hours a year`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
        >
          <span
            className="block h-full rounded-full"
            style={{
              width: `${shownPct}%`,
              background: "linear-gradient(90deg, #22D3EE, #C8FF4D)",
              boxShadow: "0 0 10px rgba(200,255,77,0.5)",
            }}
          />
        </div>
      </section>

      {/* Daily practice module */}
      <SectionHead right="Core multiplier" icon={<Timer size={12} />} title="Daily practice" />
      <article className="mt-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
        <div className="flex items-center gap-3">
          <span className={cn("grid size-9 shrink-0 place-items-center rounded-full border", toneChip.lime)}>
            <Timer className="size-4" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[13px] font-semibold leading-tight text-foreground">Sprint session</h3>
            <p className="mt-0.5 text-[9px] font-medium text-[#C8FF4D]">
              {sprints} {sprints === 1 ? "sprint" : "sprints"} × {Math.round(mins / sprints)} min blocks
            </p>
          </div>
          <Stepper
            label="daily minutes"
            value={mins}
            options={DAILY_TIME_OPTIONS}
            tone="lime"
            unit="min/day"
            onSpin={(v) => onChange({ dailyMinutes: v })}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
          <span className="inline-flex flex-none items-center font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/60">
            Remind at:
          </span>
          <Sel label="Daily reminder time" value={value.reminderTime} onChange={(v) => onChange({ reminderTime: v })} flex />
        </div>
      </article>

      {/* Reclaim modules */}
      <SectionHead right="Where it hides" icon={<Layers size={12} />} title="Dead-time presets" />
      <div className="mt-3 flex flex-col gap-2.5">
        {RECLAIM_MODULES.map((m) => (
          <ReclaimModule
            key={m.id}
            id={m.id}
            icon={m.icon}
            tone={m.tone}
            slotMin={m.slotMin}
            sub={m.sub}
            active={value.reclaimSlot === m.id}
            value={value}
            onChange={onChange}
          />
        ))}
      </div>

      {/* Dynamic formula */}
      <section aria-label="Dynamic practice formula" className="mt-6 rounded-2xl border border-white/[0.08] bg-black/40 p-3.5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="font-mono flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <Sigma size={12} className="flex-none text-[#C8FF4D]" />
            Dynamic formula
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-cyan-400">
            <Dot color="#22D3EE" small pulse /> Live parser
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2" aria-live="polite">
          <span className="rounded-md border border-cyan-400/50 bg-cyan-400/10 px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-[0.03em] text-cyan-400">
            {sprints} {sprints === 1 ? "Stack" : "Stacks"} configured
          </span>
          <span className="font-mono text-[11px] font-medium text-muted-foreground/60">=</span>
          <span className="rounded-md border border-[#C8FF4D]/40 bg-[#C8FF4D]/10 px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-[0.03em] text-[#C8FF4D]">
            {mins} min/day
          </span>
        </div>
        <p className="mt-2.5 text-[10px] leading-[1.4] font-medium text-muted-foreground/80">
          daily practice compounded across {daysActive} day{daysActive === 1 ? "" : "s"} a week
        </p>
        <span className="mt-2 inline-block rounded-md border border-[#C8FF4D]/40 bg-[#C8FF4D]/[0.08] px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-[0.03em] text-[#C8FF4D]">
          {weekdayLabel(weeklyMin)} reclaimed
        </span>
        <p className="mt-2.5 font-mono flex items-center gap-1.5 text-[9.5px] leading-[1.3] text-cyan-400">
          <Dot color="#22D3EE" small /> Reminder + trigger notifications primed
        </p>
      </section>

      {/* Trigger decoder */}
      <section aria-label="Trigger decoder" className="mt-3 rounded-2xl border border-fuchsia-400/25 bg-fuchsia-400/[0.05] p-3.5">
        <div className="flex items-center gap-3">
          <span className={cn("grid size-9 shrink-0 place-items-center rounded-full border", toneChip.fuchsia)}>
            <Brain className="size-4" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="flex items-center gap-1.5 text-[12px] font-semibold leading-tight text-foreground">
              Trigger Decoder
              <span className="rounded bg-fuchsia-400/15 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-fuchsia-300">
                Live sync
              </span>
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {TRIGGER_TYPES.map((tr) => (
                <button
                  key={tr}
                  type="button"
                  aria-pressed={value.triggerType === tr}
                  onClick={() => onChange({ triggerType: tr })}
                  className={cn(
                    "rounded-md border px-2 py-1 font-mono text-[8.5px] font-bold uppercase tracking-[0.05em] transition-colors",
                    value.triggerType === tr
                      ? "border-fuchsia-400/55 bg-fuchsia-400/15 text-fuchsia-300"
                      : "border-white/[0.08] text-muted-foreground/70",
                  )}
                >
                  {tr}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
          <span className="inline-flex flex-none items-center font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/60">
            Trigger at:
          </span>
          <Sel label="Trigger time" value={value.triggerTime} onChange={(v) => onChange({ triggerTime: v })} flex />
        </div>
      </section>
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

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const closingRef = useRef(false);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    store.setDailyMinutes(value.dailyMinutes);
    store.setReminderTime(value.reminderTime);
    store.setReclaimSlot(value.reclaimSlot);
    store.setReclaimWindow(value.reclaimWindow);
    store.setTriggerType(value.triggerType);
    store.setTriggerTime(value.triggerTime);
    store.setWeekDays(value.weekDays);
    void applyStoryNotifications(value);
    const done = () => onCloseRef.current();
    const el = overlayRef.current;
    if (!el) return done();
    el.animate([{ transform: "translateX(0%)" }, { transform: "translateX(-100%)" }], { duration: 280, easing: "cubic-bezier(0.55, 0, 0.55, 0.2)", fill: "forwards" }).addEventListener("finish", done, { once: true });
  }, [value, store]);

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[70] overflow-y-auto flex justify-center"
      style={{ background: "linear-gradient(180deg, rgba(10,12,10,0.99) 0%, rgba(14,17,13,0.99) 100%)" }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-[430px] min-h-full px-[14px] pb-[24px]">
        {/* ambient glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[300px] w-[440px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #22D3EE40, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(200,255,77,0.4), transparent)" }}
        />

        <div className="relative flex flex-col">
          {/* Protocol pill */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center pt-4"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-4 py-1.5 backdrop-blur-sm">
              <Sparkles size={12} className="text-[#C8FF4D]" />
              <span className="text-[11px] font-semibold tracking-[0.22em] text-[#C8FF4D]/85">TELL US YOUR STORY</span>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col pb-4"
          >
            <motion.p variants={itemVariants} className="mb-4 mt-3 text-center text-[12px] font-medium text-muted-foreground/50">
              Shape the plan around the life you already live.
            </motion.p>

            <motion.div variants={itemVariants}>
              <StoryCommitmentMatrix value={value} onChange={(patch) => setValue((prev) => ({ ...prev, ...patch }))} />
            </motion.div>
          </motion.div>
        </div>

        <button
          type="button"
          onClick={close}
          className="absolute right-[14px] top-[14px] z-10 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50 transition-colors hover:text-foreground/70 active:scale-95"
        >
          Skip
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 280, damping: 28 }}
          className="relative mt-6"
        >
          <button
            type="button"
            onClick={close}
            className="group relative flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 py-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#0A0C0A] transition-transform active:scale-[0.98]"
            style={{
              background: "linear-gradient(90deg, #C8FF4D, #B9F45C)",
              boxShadow: "0 10px 34px rgba(200,255,77,0.25), 0 1px 0 rgba(255,255,255,0.25) inset",
            }}
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/55 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
            <span className="relative flex items-center gap-2.5">
              <Lock size={14} strokeWidth={3} />
              Start configuring
            </span>
          </button>
          <p className="mt-2.5 text-center text-[10px] font-medium text-muted-foreground/35">
            You can adjust all of this anytime in Settings.
          </p>
        </motion.div>
      </div>
    </div>,
    document.body,
  );
}