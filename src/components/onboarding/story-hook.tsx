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
  Layers,
  Lock,
  Minus,
  Plus,
  Sandwich,
  Sigma,
  Timer,
  TrainFront,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { applyStoryNotifications } from "@/lib/notifications/story-reminders";
import type { StoryCommitment } from "@/lib/types/onboarding";
import { DAILY_TIME_OPTIONS } from "@/lib/types/onboarding";
import { useOnboardingStore } from "@/stores/onboarding-store";

/* ── Habit-decoder palette ── */

const HD = {
  green: "#39FF14",
  cyan: "#22E5FF",
  teal: "#2DD4BF",
  purple: "#B66CFF",
  orange: "#FF8C5A",
  bg: "#050807",
  panel: "#0E1312",
  line: "#1E2724",
  mute: "#7C8883",
  dim: "#4B5652",
  ink: "#E9F1EC",
};

const RGB = {
  green: "57,255,20",
  cyan: "34,229,255",
  teal: "45,212,191",
  orange: "255,140,90",
  purple: "182,108,255",
  slate: "170,180,176",
};

const rgba = (rgb: string, a: number) => `rgba(${rgb},${a})`;

const RECLAIM_MODULES = [
  { id: "Subway Commute", icon: TrainFront, accent: "teal", slotMin: 10 },
  { id: "Lunch Break", icon: Sandwich, accent: "orange", slotMin: 15 },
  { id: "Evening Walk", icon: Footprints, accent: "green", slotMin: 20 },
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
  if (days[5] && days[6] && days.slice(0, 5).every((d) => !d)) return "It's a wknd";
  return `${n}/7 days`;
}

const timeWith = (v: string) =>
  TIME_OPTIONS.includes(v) ? TIME_OPTIONS : [...TIME_OPTIONS, v].sort((a, b) => a.localeCompare(b));

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

function Dot({ color, pulse, small }: { color: string; pulse?: boolean; small?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block flex-none rounded-full", small ? "size-[5px]" : "size-[7px]", pulse && "animate-pulse")}
      style={{ background: color, boxShadow: `0 0 8px ${color}` }}
    />
  );
}

function MonoLabel({ children, dim, icon }: { children: React.ReactNode; dim?: boolean; icon?: React.ReactNode }) {
  return (
    <span
      className={cn(
        "font-mono text-[9px] font-medium uppercase tracking-[0.14em] leading-[1.45] inline-flex items-center gap-[7px]",
        dim ? "text-[#4B5652]" : "text-[#c3cdc8]",
      )}
    >
      {icon && <span className="flex-none [&>svg]:size-[12px]" style={{ color: HD.green }}>{icon}</span>}
      {children}
    </span>
  );
}

function SectionHead({ icon, title, right }: { icon: React.ReactNode; title: string; right: string }) {
  return (
    <div className="flex items-center justify-between gap-2 mt-[18px] mb-[10px] font-mono text-[9px] leading-[1.4]">
      <span className="inline-flex items-center gap-[6px] font-bold uppercase tracking-[0.12em] text-[#22E5FF]">
        <span className="flex-none [&>svg]:size-[12px]">{icon}</span>
        {title}
      </span>
      <span className="text-[#7C8883]">{right}</span>
    </div>
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
      style={{
        border: "1px solid #27302d",
        borderRadius: 8,
        backgroundColor: "#080b0a",
        color: "#fff",
        fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
        fontSize: 10,
        fontWeight: 500,
        padding: "7px 8px",
        cursor: "pointer",
        textOverflow: "ellipsis",
        appearance: "none",
        WebkitAppearance: "none",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%237c8883' stroke-width='1.5'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 7px center",
      }}
      className={cn("min-w-0", flex ? "flex-1 basis-[104px]" : "w-full")}
    >
      {options.map((o) => (
        <option key={o} value={o}>
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
  rgb,
}: {
  value: number;
  options: number[];
  onSpin: (v: number) => void;
  label: string;
  unit: string;
  rgb: string;
}) {
  const idx = Math.max(0, options.indexOf(value));
  return (
    <div role="group" aria-label={label}>
      <div
        className="flex items-center gap-[6px] rounded-[9px] p-[5px]"
        style={{ background: "#000", border: `1px solid rgba(${rgb},0.45)` }}
      >
        <button
          type="button"
          aria-label={`Reduce ${label}`}
          disabled={idx <= 0}
          onClick={() => onSpin(options[idx - 1])}
          className="grid size-6 place-items-center rounded-md border-0 bg-[#1d2422] text-[#7C8883] transition-opacity disabled:opacity-35"
        >
          <Minus size={12} strokeWidth={3} />
        </button>
        <span className="flex min-w-[44px] flex-col items-center font-mono font-bold leading-[1.15] text-white tabular-nums">
          <span className="text-[11px]">{value}</span>
          <i className="text-[8px] font-medium not-italic text-[#7C8883]">{unit}</i>
        </span>
        <button
          type="button"
          aria-label={`Raise ${label}`}
          disabled={idx >= options.length - 1}
          onClick={() => onSpin(options[idx + 1])}
          className="grid size-6 place-items-center rounded-md border-0 text-[#041004] transition-opacity disabled:opacity-35"
          style={{ background: `rgb(${rgb})` }}
        >
          <Plus size={12} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

function DayButtons({ days, onChange, rgb }: { days: boolean[]; onChange: (i: number) => void; rgb: string }) {
  return (
    <div role="group" aria-label="Active days" className="flex gap-[4px]">
      {DAY_LABELS.map((d, i) => (
        <button
          key={`${d}-${i}`}
          type="button"
          aria-pressed={!!days[i]}
          aria-label={`Day ${d} ${i + 1}`}
          onClick={() => onChange(i)}
          className="size-[22px] rounded-md border-0 text-[9.5px] font-bold font-mono leading-none transition-colors"
          style={
            days[i]
              ? { background: `rgb(${rgb})`, color: "#051005" }
              : { background: "#182020", color: "#56625d" }
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
  icon,
  accent,
  slotMin,
  active,
  value,
  onChange,
}: {
  id: string;
  icon: React.ReactNode;
  accent: string;
  slotMin: number;
  active: boolean;
  value: StoryCommitment;
  onChange: (patch: Partial<StoryCommitment>) => void;
}) {
  const rgb = RGB[accent as keyof typeof RGB] ?? RGB.slate;
  const win = parseWindow(value.reclaimWindow);
  const days = safeDays(value.weekDays);
  const cadence = cadenceLabel(days);

  return (
    <article
      className="rounded-[14px] p-[12px] transition-[border-color,box-shadow,opacity] duration-200"
      style={{
        background: HD.panel,
        border: `1px solid ${active ? rgba(rgb, 0.9) : rgba(rgb, 0.28)}`,
        boxShadow: active ? `0 0 0 1px ${rgba(rgb, 0.2)}, 0 0 20px ${rgba(rgb, 0.16)}` : undefined,
        opacity: active ? 1 : 0.6,
      }}
      onClick={() => onChange({ reclaimSlot: id })}
    >
      <div className="flex items-center gap-[10px]">
        <span
          className="grid size-[42px] flex-none place-items-center rounded-[10px]"
          style={{ color: `rgb(${rgb})`, background: rgba(rgb, 0.1), border: `1px solid ${rgba(rgb, 0.4)}` }}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[12px] font-bold uppercase tracking-[0.03em] text-white leading-[1.2]">{id}</h3>
          <p className="mt-[4px] font-mono text-[9.5px] leading-[1.4]" style={{ color: `rgb(${rgb})` }}>
            {slotMin} min/slot = {slotMin} min reclaimed
          </p>
        </div>
        <span
          className={cn(
            "grid size-5 flex-none place-items-center rounded-full transition-all",
            active ? "text-[#041004]" : "border",
          )}
          style={
            active
              ? { background: `rgb(${rgb})`, boxShadow: `0 0 12px ${rgba(rgb, 0.5)}` }
              : { borderColor: rgba(rgb, 0.4), color: rgba(rgb, 0.5) }
          }
        >
          {active && <Check size={10} strokeWidth={3.5} />}
        </span>
      </div>

      <div className="mt-[12px] flex flex-wrap items-center gap-2">
        <span className="inline-flex min-w-[54px] flex-none items-center gap-1 font-mono text-[9.5px] leading-none text-[#4B5652]">
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

      <div className="mt-[12px] flex flex-wrap items-center gap-2">
        <span className="inline-flex min-w-[54px] flex-none items-center font-mono text-[9.5px] leading-none text-[#4B5652]">
          Cadence:
        </span>
        <DayButtons days={days} onChange={(i) => onChange({ weekDays: days.map((v, j) => (j === i ? !v : v)) })} rgb={rgb} />
        <span className="ml-auto whitespace-nowrap text-right font-mono text-[9.5px] font-bold leading-[1.2]" style={{ color: `rgb(${rgb})` }}>
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
    <div className="flex flex-col gap-[2px]">
      {/* Stage tabs */}
      <div className="flex">
        <div
          className="flex flex-[1.5] items-center gap-[6px] rounded-l-[8px] px-[10px] py-[8px] font-mono text-[8.5px] font-bold uppercase leading-[1.4] tracking-[0.1em]"
          style={{ color: HD.green, background: rgba(RGB.green, 0.09), border: `1px solid ${rgba(RGB.green, 0.35)}` }}
        >
          <span className="grid flex-none place-items-center">⚙</span>
          <span className="min-w-0">Stage 1: Leak finder &amp; voice audit</span>
        </div>
        <div
          className="flex flex-1 items-center rounded-r-[8px] px-[10px] py-[8px] font-mono text-[8.5px] font-bold uppercase leading-[1.4] tracking-[0.1em]"
          style={{ color: HD.cyan, background: rgba(RGB.cyan, 0.09), border: `1px solid ${rgba(RGB.cyan, 0.35)}`, borderLeftColor: "transparent" }}
        >
          Multi instance active
        </div>
      </div>

      {/* Hero — annual time reclaimed */}
      <section
        aria-label="Annual time reclaimed"
        className="mt-[12px] rounded-[16px] p-[14px]"
        style={{
          border: `1.5px solid ${rgba(RGB.green, 0.8)}`,
          background: `linear-gradient(180deg, ${rgba(RGB.green, 0.07)}, ${rgba(RGB.slate, 0.04)})`,
          boxShadow: `0 0 22px ${rgba(RGB.green, 0.16)}, inset 0 0 26px ${rgba(RGB.green, 0.04)}`,
        }}
      >
        <div className="flex items-start justify-between gap-[10px]">
          <MonoLabel icon={<Hourglass size={13} />}>
            Annual time
            <br />
            reclaimed
          </MonoLabel>
          <span
            className="inline-flex flex-none items-center gap-[6px] rounded-[7px] px-[9px] py-[6px] font-mono text-[8.5px] font-bold uppercase leading-[1.4] tracking-[0.12em]"
            style={{ color: HD.green, border: `1px solid ${rgba(RGB.green, 0.35)}`, background: rgba(RGB.green, 0.08) }}
          >
            <Zap size={11} />
            <span>
              Speed booster
              <br />
              +{Math.min(60, Math.round((mins / 30) * 25))}%
            </span>
          </span>
        </div>

        <p className="my-[10px] flex items-baseline gap-2 whitespace-nowrap" aria-live="polite">
          <b
            className="text-[clamp(28px,9vw,36px)] font-bold leading-none tracking-[-0.015em] text-[#39FF14] tabular-nums"
            style={{ textShadow: "0 0 18px rgba(57,255,20,0.45)" }}
          >
            +{shownHours} HOURS
          </b>
          <small className="font-mono text-[11px] font-semibold tracking-[0.1em] text-[#E9F1EC]">/ YEAR</small>
        </p>

        <div className="mb-[9px] flex justify-between gap-2 font-mono text-[10px] leading-[1.4]">
          <span className="text-[#22E5FF]">
            <Dot color={HD.cyan} small /> +{weeklyHours.toFixed(2)} hrs/week converted
          </span>
          <span className="text-[#7C8883]">Compounding daily</span>
        </div>

        <div
          className="h-[6px] overflow-hidden rounded-[4px]"
          role="progressbar"
          aria-label={`Progress toward ${YEARLY_GOAL_HOURS} hours a year`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          style={{ background: "#1a211f" }}
        >
          <span
            className="block h-full rounded-[4px]"
            style={{
              width: `${shownPct}%`,
              background: "linear-gradient(90deg, #22E5FF, #39FF14)",
              boxShadow: "0 0 10px rgba(57,255,20,0.5)",
            }}
          />
        </div>
      </section>

      {/* Daily practice module */}
      <SectionHead icon={<Timer size={12} />} title="Daily practice" right="Core multiplier" />
      <article
        className="rounded-[14px] p-[12px]"
        style={{ background: HD.panel, border: `1px solid ${rgba(RGB.green, 0.28)}` }}
      >
        <div className="flex items-center gap-[10px]">
          <span
            className="grid size-[42px] flex-none place-items-center rounded-[10px]"
            style={{ color: HD.green, background: rgba(RGB.green, 0.1), border: `1px solid ${rgba(RGB.green, 0.4)}` }}
          >
            <Timer size={20} strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.03em] leading-[1.2] text-white">Sprint session</h3>
            <p className="mt-[4px] font-mono text-[9.5px] leading-[1.4] text-[#39FF14]">
              {sprints} {sprints === 1 ? "sprint" : "sprints"} × {Math.round(mins / sprints)} min blocks
            </p>
          </div>
          <Stepper
            label="daily minutes"
            value={mins}
            options={DAILY_TIME_OPTIONS}
            rgb={RGB.green}
            unit="min/day"
            onSpin={(v) => onChange({ dailyMinutes: v })}
          />
        </div>
        <div className="mt-[12px] flex flex-wrap items-center gap-2">
          <span className="inline-flex min-w-[54px] flex-none items-center font-mono text-[9.5px] leading-none text-[#4B5652]">
            Remind at:
          </span>
          <Sel
            label="Daily reminder time"
            value={value.reminderTime}
            onChange={(v) => onChange({ reminderTime: v })}
            flex
          />
        </div>
      </article>

      {/* Reclaim modules */}
      <SectionHead icon={<Layers size={12} />} title="Modular dead-time presets" right="Where it hides" />
      <div className="flex flex-col gap-[10px]">
        {RECLAIM_MODULES.map((m) => (
          <ReclaimModule
            key={m.id}
            id={m.id}
            icon={<m.icon size={20} strokeWidth={1.75} />}
            accent={m.accent}
            slotMin={m.slotMin}
            active={value.reclaimSlot === m.id}
            value={value}
            onChange={onChange}
          />
        ))}
      </div>

      {/* Dynamic multi-stack formula */}
      <section aria-label="Dynamic multi-stack formula" className="mt-[14px] rounded-[14px] p-[12px]" style={{ background: "#000", border: `1px solid ${rgba(RGB.green, 0.35)}` }}>
        <div className="mb-[11px] flex items-center justify-between gap-2">
          <MonoLabel dim icon={<Sigma size={12} />}>Dynamic multi-stack formula</MonoLabel>
          <span className="whitespace-nowrap font-mono text-[9px] font-bold uppercase leading-none tracking-[0.1em] text-[#22E5FF]">
            <Dot color={HD.cyan} small pulse /> Live parser
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2" aria-live="polite">
          <span className="rounded-[5px] px-[9px] py-[6px] font-mono text-[10px] font-bold leading-[1.2] tracking-[0.03em]" style={{ color: HD.cyan, background: rgba(RGB.cyan, 0.1), border: `1px solid ${rgba(RGB.cyan, 0.5)}` }}>
            {sprints} {sprints === 1 ? "Stack" : "Stacks"} configured
          </span>
          <span className="font-mono text-[11px] font-medium text-[#7C8883]">=</span>
          <span className="rounded-[5px] px-[9px] py-[6px] font-mono text-[10px] font-bold leading-[1.2] tracking-[0.03em]" style={{ color: HD.orange, background: rgba(RGB.orange, 0.12), border: `1px solid ${rgba(RGB.orange, 0.35)}` }}>
            {mins} min/day
          </span>
        </div>
        <p className="mt-[10px] font-mono text-[10px] leading-[1.3] text-[#d6dfda]">daily practice compounded across {daysActive} day{daysActive === 1 ? "" : "s"} a week</p>
        <span className="mt-2 block rounded-[5px] px-[9px] py-[6px] font-mono text-[10px] font-bold leading-[1.2] tracking-[0.03em]" style={{ color: HD.green, background: rgba(RGB.green, 0.08), border: `1px solid ${rgba(RGB.green, 0.5)}` }}>
          {weekdayLabel(weeklyMin)} reclaimed
        </span>
        <p className="mt-[10px] font-mono text-[9.5px] leading-[1.3] text-[#22E5FF]">
          <Dot color={HD.cyan} small /> Reminder + trigger notifications primed
        </p>
      </section>

      {/* Trigger decoder (voice-style) */}
      <section aria-label="Trigger decoder" className="mt-[10px] rounded-[14px] p-[11px]" style={{ background: rgba(RGB.purple, 0.06), border: `1px solid ${rgba(RGB.purple, 0.32)}` }}>
        <div className="flex items-center gap-[10px]">
          <span
            className="grid size-[38px] flex-none place-items-center rounded-[10px]"
            style={{ color: HD.purple, background: rgba(RGB.purple, 0.12), border: `1px solid ${rgba(RGB.purple, 0.45)}` }}
          >
            <Brain size={18} strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[11px] font-bold leading-[1.3] text-white">
              Trigger Decoder
              <span className="ml-[4px] rounded-[4px] px-[6px] py-[2px] align-[1px] font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-[#B66CFF]" style={{ background: rgba(RGB.purple, 0.18) }}>
                Live sync
              </span>
            </h3>
            <div className="mt-[6px] flex flex-wrap gap-[6px]">
              {TRIGGER_TYPES.map((tr) => (
                <button
                  key={tr}
                  type="button"
                  aria-pressed={value.triggerType === tr}
                  onClick={() => onChange({ triggerType: tr })}
                  className={cn("rounded-md border px-[7px] py-[4px] font-mono text-[8.5px] font-bold uppercase tracking-[0.05em] transition-colors")}
                  style={
                    value.triggerType === tr
                      ? { color: HD.purple, borderColor: rgba(RGB.purple, 0.55), background: rgba(RGB.purple, 0.15) }
                      : { color: HD.mute, borderColor: "rgba(255,255,255,0.1)", background: "transparent" }
                  }
                >
                  {tr}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-[10px] flex flex-wrap items-center gap-2">
          <span className="inline-flex min-w-[54px] flex-none items-center font-mono text-[9.5px] leading-none text-[#4B5652]">
            Trigger at:
          </span>
          <Sel
            label="Trigger time"
            value={value.triggerTime}
            onChange={(v) => onChange({ triggerTime: v })}
            flex
          />
        </div>
      </section>
    </div>
  );
}

function weekdayLabel(weeklyMin: number) {
  if (weeklyMin >= 60) {
    const h = (weeklyMin / 60).toFixed(1).replace(/\.0$/, "");
    return `~${h} hrs / week`;
  }
  return `${weeklyMin} min / week`;
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
  }, [value, persist]);

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[70] overflow-y-auto flex justify-center"
      style={{ background: HD.bg, color: HD.ink }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-[430px] min-h-full px-[14px] pb-[24px] border-x" style={{ borderColor: HD.line }}>
        {/* scanline + cyan wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[280px]"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 0, rgba(34,229,255,0.11), transparent 70%), repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 4px)",
          }}
        />
        <div className="relative flex flex-col">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col"
          >
            {/* Terminal header */}
            <motion.header variants={itemVariants} className="flex items-center justify-between gap-[10px] pt-[16px] mb-[12px]">
              <h1 className="flex items-start gap-[9px] font-mono text-[10px] font-bold leading-[1.55] tracking-[0.16em] uppercase text-[#22E5FF]" style={{ margin: 0 }}>
                <Dot color={HD.green} />
                <span>Story Decoder // Step 1 of 1</span>
              </h1>
              <div className="flex flex-none items-center gap-2 rounded-[8px] px-[10px] py-[7px] font-mono text-[8.5px] font-bold leading-[1.4] tracking-[0.14em] uppercase text-[#39FF14]" style={{ border: `1px solid ${HD.line}`, background: "rgba(0,0,0,0.5)" }}>
                <Dot color={HD.green} small />
                <span>
                  Mode:
                  <br />
                  Active
                </span>
              </div>
            </motion.header>

            <motion.div variants={itemVariants}>
              <StoryCommitmentMatrix value={value} onChange={(patch) => setValue((prev) => ({ ...prev, ...patch }))} />
            </motion.div>
          </motion.div>
        </div>

        <button
          type="button"
          onClick={close}
          className="absolute top-[18px] right-[14px] z-10 text-[10px] font-bold font-mono uppercase tracking-[0.1em] text-[#4B5652] transition-colors hover:text-[#7C8883] active:scale-95"
        >
          Skip
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 280, damping: 28 }}
          className="relative mt-[18px]"
        >
          <button
            type="button"
            onClick={close}
            className="flex w-full items-center justify-between gap-3 rounded-[12px] px-[16px] py-[16px] text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#041004] transition-colors active:translate-y-[1px]"
            style={{
              background: HD.green,
              border: `1.5px solid ${HD.green}`,
              color: "#041004",
              boxShadow: "0 0 26px rgba(57,255,20,0.35)",
            }}
          >
            <Lock size={16} className="flex-none" />
            <span className="text-center">Lock protocol &amp; deploy notifications</span>
            <span className="flex-none font-mono text-[10px] font-bold leading-none">2/2</span>
          </button>
          <footer className="mt-[12px] flex items-start justify-between gap-3 font-mono text-[9px] leading-[1.45]">
            <span className="text-[#22E5FF]">
              <Dot color={HD.cyan} small /> Reminder + trigger cache primed
            </span>
            <span className="max-w-[40%] flex-none text-right text-[#7C8883]">Adjust anytime in Settings</span>
          </footer>
        </motion.div>
      </div>
    </div>,
    document.body,
  );
}