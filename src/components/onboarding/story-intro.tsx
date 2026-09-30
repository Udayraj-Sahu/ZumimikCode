"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { BLACKGREEN, CYAN, CYAN_251, FUCHSIA, GLASS_06, GLASS_09, GLASS_12, LIME, LIME_067, LIME_133, LIME_40, LIME_LIGHT, SLATE_MUTED } from "@/lib/theme-tokens";
import { useThemeStore } from "@/stores/theme-store";
import { createPortal } from "react-dom";
import { MotionConfig, motion, AnimatePresence, useReducedMotion, type Variants } from "motion/react";
import { SPECTRUM_BARS, useVoiceSpectrum } from "@/hooks/use-voice-spectrum";
import {
  AlertTriangle,
  Brain,
  Footprints,
  Hourglass,
  Layers,
  Lock,
  Mic,
  Minus,
  Plus,
  Sandwich,
  Search,
  Sigma,
  Sparkles,
  Square,
  Timer,
  TrainFront,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { applyStoryNotifications } from "@/lib/notifications/story-reminders";
import { parseCommitmentSpeech, VOICE_EXAMPLE } from "@/lib/story/commitment-speech";
import type { VoiceSession } from "@/lib/native/speech";
import {
  RECLAIM_MODULES as RECLAIM_META,
  DAY_LABELS as STORY_DAY_LABELS,
  TRIGGER_TYPES as STORY_TRIGGER_TYPES,
} from "@/lib/story/story-options";
import type { StoryCommitment } from "@/lib/types/onboarding";
import { DAILY_TIME_OPTIONS } from "@/lib/types/onboarding";
import { useOnboardingStore } from "@/stores/onboarding-store";

const ACCENT = LIME;

type Tone = "lime" | "cyan" | "fuchsia";

const toneChip: Record<Tone, string> = {
  lime: "border-[var(--lime-50)] bg-[var(--lime-10)] text-[var(--lime)]",
  cyan: "border-cyan-400/50 bg-cyan-400/10 text-[var(--cyan)]",
  fuchsia: "border-fuchsia-400/50 bg-fuchsia-400/10 text-[var(--fuchsia)]",
};

const toneText: Record<Tone, string> = {
  lime: "text-[var(--lime)]",
  cyan: "text-[var(--cyan)]",
  fuchsia: "text-[var(--fuchsia)]",
};

const toneHex: Record<Tone, string> = {
  lime: LIME,
  cyan: CYAN,
  fuchsia: FUCHSIA,
};

const toneDark: Record<Tone, string> = {
  lime: "#4D7C0F",
  cyan: "#0E7490",
  fuchsia: "#A21CAF",
};

const RECLAIM_ICONS: Record<string, typeof TrainFront> = {
  "Subway Commute": TrainFront,
  "Lunch Break": Sandwich,
  "Evening Walk": Footprints,
};

const RECLAIM_MODULES = RECLAIM_META.map((m) => ({ ...m, icon: RECLAIM_ICONS[m.id] }));

const DAY_LABELS = STORY_DAY_LABELS;

const TRIGGER_TYPES = STORY_TRIGGER_TYPES;

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

const toMinutes = (t: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t ?? "");
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
};

const LAST_SLOT = 23 * 60 + 45;

const clampWindow = (from: string, to: string): string => {
  const a = Math.min(LAST_SLOT, toMinutes(from));
  let b = Math.min(LAST_SLOT, toMinutes(to));
  if (b <= a) b = Math.min(LAST_SLOT, a + 15);
  const pad = (n: number) =>
    `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  return `${pad(a)} - ${pad(b)}`;
};

const safeDays = (v?: boolean[]) =>
  v && v.length === 7 ? v : Array.from({ length: 7 }, () => true);

function cadenceLabel(days: boolean[]) {
  const n = days.filter(Boolean).length;
  if (n === 0) return "Paused";
  if (n === 7) return "Daily · 7/7";
  if (days.slice(0, 5).every(Boolean) && !days[5] && !days[6]) return "Weekday";
  if (days[5] && days[6] && days.slice(0, 5).every((d) => !d)) return "Weekend";
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
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
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

/* ── Shared panel shell ── */

function Panel({
  tone = "lime",
  className,
  children,
  ariaLabel,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const hex = toneHex[tone];
  const theme = useThemeStore((s) => s.theme);
  const line = theme === "light" ? toneDark[tone] : `${hex}22`;
  return (
    <section
      aria-label={ariaLabel}
      className={cn(
        "relative overflow-hidden border p-4",
        theme === "light" ? "rounded-[16px] bg-white/[0.02]" : "rounded-2xl bg-black/25",
        className,
      )}
      style={{ borderColor: line }}
    >
      {/* top hairline + scan flicker */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${hex}77, transparent)` }}
      />
      {/* corner brackets */}
      {(
        [
          "top-0 left-0 border-t border-l",
          "top-0 right-0 border-t border-r",
          "bottom-0 left-0 border-b border-l",
          "bottom-0 right-0 border-b border-r",
        ] as const
      ).map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={cn("pointer-events-none absolute z-10 size-[7px] opacity-70", pos)}
          style={{ borderColor: hex }}
        />
      ))}
      {children}
    </section>
  );
}

function SectionHead({
  icon,
  title,
  right,
  rightClass,
}: {
  icon: React.ReactNode;
  title: string;
  right?: string;
  rightClass?: string;
}) {
  return (
    <div className="mt-7 flex items-center justify-between gap-2">
      <h2
        className={cn(
          "flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground",
        )}
      >
        <span className="flex-none [&>svg]:size-[12px] [&>svg]:text-[var(--lime)]">{icon}</span>
        {title}
      </h2>
      {right && (
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--cyan)]",
            rightClass,
          )}
        >
          {right}
        </p>
      )}
    </div>
  );
}

function Dot({
  color = ACCENT,
  pulse,
  small,
}: {
  color?: string;
  pulse?: boolean;
  small?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block flex-none rounded-full",
        small ? "size-[5px]" : "size-[6px]",
        pulse && "animate-pulse",
      )}
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
        "min-w-0 cursor-pointer rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-[7px]  text-[10px] font-medium text-foreground outline-none appearance-none tabular-nums",
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
        <option key={o} value={o} className="bg-[var(--bg-deep)] text-foreground">
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
  const theme = useThemeStore((s) => s.theme);
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex flex-none items-center gap-[6px] rounded-full border p-[4px]",
        theme === "light"
          ? "border-white/[0.07] bg-white/[0.02]"
          : "keep-white border-white/[0.08] bg-black/40",
      )}
    >
      <button
        type="button"
        aria-label={`Reduce ${label}`}
        disabled={idx <= 0}
        onClick={() => onSpin(options[idx - 1])}
        className="grid size-6 place-items-center rounded-full bg-white/[0.06] text-muted-foreground transition-opacity disabled:opacity-35"
      >
        <Minus size={12} strokeWidth={3} />
      </button>
      <span
        className={cn(
          "flex min-w-[44px] flex-col items-center font-bold leading-[1.15] text-foreground tabular-nums",
        )}
      >
        <span className="text-[11px]">{value}</span>
        <i className="text-[8px] font-medium not-italic text-white/60">{unit}</i>
      </span>
      <button
        type="button"
        aria-label={`Raise ${label}`}
        disabled={idx >= options.length - 1}
        onClick={() => onSpin(options[idx + 1])}
        className={cn(
          "grid size-6 place-items-center rounded-full text-[var(--on-accent)] transition-opacity disabled:opacity-35",
          tone === "lime" ? "bg-[var(--lime)]" : tone === "cyan" ? "bg-cyan-400" : "bg-fuchsia-400",
        )}
      >
        <Plus size={12} strokeWidth={3} />
      </button>
    </div>
  );
}

function DayButtons({
  days,
  onChange,
  tone,
}: {
  days: boolean[];
  onChange: (i: number) => void;
  tone: Tone;
}) {
  const onBg = tone === "lime" ? LIME : tone === "cyan" ? CYAN : FUCHSIA;
  return (
    <div role="group" aria-label="Active days" className="flex gap-[4px]">
      {DAY_LABELS.map((d, i) => (
        <button
          key={`${d}-${i}`}
          type="button"
          aria-pressed={!!days[i]}
          aria-label={`Day ${d} ${i + 1}`}
          onClick={() => onChange(i)}
          className="size-[22px] rounded-[6px] border-0  text-[9.5px] font-bold leading-none transition-colors"
          style={
            days[i]
              ? { background: onBg, color: BLACKGREEN, boxShadow: `0 0 12px ${onBg}66` }
              : { background: GLASS_06, color: SLATE_MUTED }
          }
        >
          {d}
        </button>
      ))}
    </div>
  );
}

/* ── Overlapping span for a segment ── */

const overlapFraction = (start: number, end: number, from: number, to: number) =>
  Math.max(0, Math.min(end, to) - Math.max(start, from)) / (end - start);

/* ── Day decompiler rail ── */

function DayRail({ value, spanMin }: { value: StoryCommitment; spanMin: number }) {
  const modIdx = RECLAIM_MODULES.findIndex((m) => m.id === value.reclaimSlot);
  const tone = modIdx >= 0 ? RECLAIM_MODULES[modIdx].tone : "lime";
  const window = value.reclaimConfigs?.[value.reclaimSlot]?.window ?? value.reclaimWindow;
  const { from } = parseWindow(window);
  const fromMin = toMinutes(from);
  const hex = toneHex[tone];
  const minutes = Math.min(1440, Math.max(0, spanMin || 0));
  const lightFrom = Math.min(fromMin, 1440 - Math.max(0, minutes - 1));
  const lightTo = Math.min(1440, lightFrom + minutes);
  const hours = Array.from({ length: 24 }, (_, h) =>
    overlapFraction(h * 60, (h + 1) * 60, lightFrom, lightTo),
  );

  return (
    <div className="mt-4" aria-label="24-hour day rail with reclaim span highlighted">
      <div className="relative flex h-10 items-stretch gap-[3px]">
        {hours.map((ov, h) => {
          const sleeping = h < 6 || h >= 23;
          const base = sleeping ? GLASS_06 : GLASS_12;
          const lit = ov > 0;
          return (
            <div
              key={h}
              className="relative h-full flex-1 rounded-[3px]"
              style={{
                background: lit ? hex : base,
                boxShadow: lit ? `0 0 10px ${hex}55, 0 0 1px ${hex}` : undefined,
                opacity: lit ? 0.95 : sleeping ? 0.7 : 1,
                transition: "background 300ms ease, box-shadow 300ms ease, opacity 300ms ease",
              }}
            />
          );
        })}
        {/* scanning sweep */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 z-10 w-[2px] rounded-full"
          style={{ background: `linear-gradient(180deg, transparent, ${LIME}, transparent)` }}
          animate={{ left: ["12%", "88%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
        />
      </div>

      <div className="mt-1.5 flex justify-between px-0.5  text-[8px] text-white/30">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>23</span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1  text-[8.5px] font-bold uppercase tracking-[0.1em]"
          style={{ borderColor: `${hex}55`, background: `${hex}14`, color: hex }}
        >
          <Dot color={hex} small />
          {value.reclaimSlot || "Reclaim Slot"} · {to12h(from)} · {minutes} MIN
        </span>
        <span className=" text-[8.5px] tracking-[0.14em] text-white/50">decompiled</span>
      </div>
    </div>
  );
}

/* ── Compact per-module rail ── */

function MiniRail({ window, tone }: { window: string; tone: Tone }) {
  const { from, to } = parseWindow(window);
  const a = toMinutes(from);
  const b = Math.max(toMinutes(to), a + 10);
  const hex = toneHex[tone];
  return (
    <div className="flex h-[10px] items-stretch gap-[2px]" aria-hidden>
      {Array.from({ length: 24 }, (_, h) => {
        const ov = overlapFraction(h * 60, (h + 1) * 60, a, b);
        return (
          <span
            key={h}
            className="flex-1 rounded-[2px]"
            style={{
              background: ov > 0 ? hex : GLASS_09,
              opacity: ov > 0 ? 0.9 : 1,
              boxShadow: ov > 0 ? `0 0 6px ${hex}44` : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Reclaim module card ── */

/* One card for all three presets. The tags pick which slot is active; the
   controls below them always edit that slot, so the section is one card tall
   instead of three and the per-preset config is never edited out of sight. */
function ReclaimPanel({
  value,
  onChange,
}: {
  value: StoryCommitment;
  onChange: (patch: Partial<StoryCommitment>) => void;
}) {
  const activeIdx = Math.max(
    0,
    RECLAIM_MODULES.findIndex((m) => m.id === value.reclaimSlot),
  );
  const active = RECLAIM_MODULES[activeIdx];
  const Icon = active.icon;
  const tone = active.tone;
  const activeWindow = value.reclaimConfigs?.[active.id]?.window ?? value.reclaimWindow;
  const win = parseWindow(activeWindow);
  const days = safeDays(value.reclaimConfigs?.[active.id]?.days ?? value.weekDays);
  const cadence = cadenceLabel(days);

  const patchModule = (window: string, nextDays: boolean[]) =>
    onChange({
      reclaimConfigs: {
        ...(value.reclaimConfigs ?? {}),
        [active.id]: { window, days: nextDays },
      },
    });

  return (
    <Panel tone={tone} ariaLabel="Dead-time presets" className="p-3.5">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full border",
            toneChip[tone],
          )}
        >
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={cn("text-[13px] font-semibold leading-tight text-foreground")}>
            {active.id}
          </h3>
          <p className="mt-0.5 text-[9px] font-medium text-white/60">{active.sub}</p>
        </div>
        <span className={cn("whitespace-nowrap text-[10px] font-bold", toneText[tone])}>
          {active.slotMin} MIN
        </span>
      </div>

      <div role="radiogroup" aria-label="Reclaim slot" className="mt-3 flex flex-wrap gap-2">
        {RECLAIM_MODULES.map(({ id: tagId, icon: TagIcon, tone: tagTone }) => {
          const on = tagId === active.id;
          return (
            <button
              key={tagId}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange({ reclaimSlot: tagId })}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10px] font-bold tracking-[0.03em] transition-colors",
                on ? toneChip[tagTone] : "border-white/[0.10] bg-white/[0.03] text-white/55",
              )}
            >
              <TagIcon className="size-3 shrink-0" strokeWidth={2.2} />
              {tagId}
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5">
        <span
          className={cn(
            "inline-flex items-center font-medium text-[9px] uppercase tracking-[0.12em] text-white/60",
          )}
        >
          Window:
        </span>
        <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-[6px]">
          <Sel
            label={`${active.id} window start`}
            value={win.from}
            onChange={(v) => patchModule(clampWindow(v, win.to || "00:00"), days)}
            flex
          />
          <Sel
            label={`${active.id} window end`}
            value={win.to}
            onChange={(v) => patchModule(clampWindow(win.from || "00:00", v), days)}
            flex
          />
        </div>
      </div>

      <div className="mt-3">
        <MiniRail window={activeWindow} tone={tone} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
        <span
          className={cn(
            "inline-flex flex-none items-center font-medium text-[9px] uppercase tracking-[0.12em] text-white/60",
          )}
        >
          Cadence:
        </span>
        <DayButtons
          days={days}
          onChange={(i) =>
            patchModule(
              activeWindow,
              days.map((v, j) => (j === i ? !v : v)),
            )
          }
          tone={tone}
        />
        <span
          className={cn(
            "ml-auto whitespace-nowrap text-right text-[10px] font-bold",
            toneText[tone],
          )}
        >
          {cadence}
        </span>
      </div>
    </Panel>
  );
}

/* ── Voice commitment ── */

/**
 * Decorative stand-in for when there is no usable microphone signal — a denied
 * permission, no Web Audio, or the Android WebView where the speech recogniser
 * already owns the mic. One continuous crest sampled into thin bars, each on the
 * same keyframes at a negative delay so the crest travels left to right instead
 * of every bar pulsing together. Frozen under reduced motion.
 */
const WAVE_BARS = 28;
const WAVE_FRAMES = ["10%", "26%", "54%", "18%", "78%", "34%", "12%"];

function DecorativeWave({ active }: { active: boolean }) {
  const still = useReducedMotion();
  const live = active && !still;
  return (
    <span aria-hidden className="absolute inset-0 flex items-end justify-center gap-[2px] px-3">
      {Array.from({ length: WAVE_BARS }, (_, i) => (
        <motion.span
          key={i}
          className="flex-1 origin-bottom rounded-full bg-[var(--primary)]"
          initial={{ scaleY: 0.08 }}
          animate={live ? { scaleY: WAVE_FRAMES } : { scaleY: 0.08 }}
          transition={
            live
              ? { duration: 1.15, repeat: Infinity, ease: "easeInOut", delay: -(i * 0.028) }
              : { duration: 0.25 }
          }
        />
      ))}
    </span>
  );
}

/**
 * The Siri-style spectrum that grows out of the bottom edge of the bar.
 *
 * Absolutely positioned and behind the row's own content, so it is visually
 * attached to the search bar without ever participating in layout. Bars are
 * full-height and moved only by `scaleY` from a bottom origin, which keeps the
 * whole thing on the compositor.
 */
function VoiceSpectrum({ active }: { active: boolean }) {
  const still = useReducedMotion();
  const { hostRef, status } = useVoiceSpectrum(active && !still);

  if (status === "unavailable") return <DecorativeWave active={active} />;

  return (
    <span
      ref={hostRef}
      aria-hidden
      className="absolute inset-0 flex items-end gap-[2px] px-3 transition-opacity duration-300"
      style={{ opacity: active ? 1 : 0 }}
    >
      {Array.from({ length: SPECTRUM_BARS }, (_, i) => (
        <span
          key={i}
          className="flex-1 origin-bottom rounded-full bg-[var(--primary)] will-change-transform"
          style={{ transform: "scaleY(0.02)" }}
        />
      ))}
    </span>
  );
}

/**
 * Dictates the whole commitment in one sentence instead of working six
 * controls. Idle it is only a mic; tapping opens a listening overlay, so the
 * input never takes space away from the form it fills.
 *
 * The recogniser is only offered when the platform reports a usable one, so on
 * a device without a mic the control disappears rather than sitting there
 * broken.
 */
function VoiceCommitmentBar({
  value,
  onChange,
}: {
  value: StoryCommitment;
  onChange: (patch: Partial<StoryCommitment>) => void;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const sessionRef = useRef<VoiceSession | null>(null);
  const cancelledRef = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const still = useReducedMotion();

  useEffect(() => {
    let alive = true;
    void import("@/lib/native/speech")
      .then((m) => m.isVoiceSupported())
      .then((ok) => {
        if (alive) setSupported(ok);
      })
      .catch(() => {
        if (alive) setSupported(false);
      });
    return () => {
      alive = false;
      cancelledRef.current = true;
      if (settleTimer.current) clearTimeout(settleTimer.current);
      void sessionRef.current?.stop();
    };
  }, []);

  const clearTimer = () => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = null;
  };

  const settle = (text: string) => {
    const { patch, labels: found } = parseCommitmentSpeech(text, value);
    if (found.length === 0) {
      setLabels([]);
      setError(`Didn't catch a time, a day or a slot in "${text.trim()}".`);
      return;
    }
    onChange(patch);
    setTranscript(text);
    setLabels(found);
    setError(null);
    // Hold the result up long enough to read before the overlay collapses.
    clearTimer();
    settleTimer.current = setTimeout(() => {
      setOpen(false);
      setTranscript("");
      setLabels([]);
    }, 1900);
  };

  const start = async () => {
    clearTimer();
    cancelledRef.current = false;
    setError(null);
    setTranscript("");
    setLabels([]);
    setSpeaking(false);
    setOpen(true);

    const { startVoiceCapture } = await import("@/lib/native/speech");
    const session = await startVoiceCapture({
      // The first partial is the earliest signal that the user has actually
      // started talking, which is what wakes the spectrum up.
      onPartial: (text) => {
        setSpeaking(true);
        setTranscript(text);
      },
      onFinal: (text) => {
        sessionRef.current = null;
        setSpeaking(false);
        if (cancelledRef.current) return;
        if (text) settle(text);
        else setError("Didn't hear anything. Try again.");
      },
      onError: (text) => {
        sessionRef.current = null;
        setSpeaking(false);
        if (cancelledRef.current) return;
        setError(text);
      },
    });
    if (session) sessionRef.current = session;
  };

  const stop = async () => {
    const session = sessionRef.current;
    if (!session) return;
    await session.stop();
  };

  if (supported === false) return null;

  const listening = open && !error;

  return (
    <div className="mt-4 flex flex-col items-center gap-2.5">
      {/* The mic stretches into the bar it becomes, so the control never moves
          anywhere — layout FLIPs the same element rather than swapping one
          component for another. */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className={cn(
          "relative flex items-center overflow-hidden bg-black transition-colors duration-300",
          open ? "h-14 w-full max-w-[22rem] rounded-full" : "h-14 w-14 rounded-full",
        )}
>
        {/* Behind the row's own content and out of flow, so the crest is attached
            to the bar's bottom edge without ever shifting the layout. */}
        <VoiceSpectrum active={speaking} />

        <motion.button
          layout
          type="button"
          onClick={listening ? stop : start}
          aria-label={listening ? "Stop listening" : "Dictate your routine"}
          whileTap={still ? undefined : { scale: 0.93 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className={cn(
            "relative z-10 grid flex-none place-items-center rounded-full text-white",
            open ? "ml-1.5 size-11" : "size-14",
          )}
        >
          {listening ? (
            <Square className="relative size-3.5" strokeWidth={3} />
          ) : (
            <Mic className="relative size-5" strokeWidth={2.2} />
          )}
        </motion.button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="voice-text"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex min-w-0 flex-1 items-center gap-3 py-2 pl-1 pr-4"
            >
              <span
                aria-live="polite"
                className={cn(
                  "min-w-0 flex-1 truncate text-[12px] leading-tight font-medium",
                  transcript ? "text-white/90" : "text-white/35",
                )}
              >
{error ? error : speaking ? transcript : null}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence initial={false}>
        {labels.length > 0 && (
          <motion.div
            key="voice-labels"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="flex w-full max-w-[22rem] flex-wrap items-center justify-center gap-2"
          >
            {labels.map((label) => (
              <motion.span
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className="rounded-md border border-[var(--lime-40)] bg-[var(--lime-10)] px-2.5 py-1.5 text-[10px] font-bold tracking-[0.03em] text-[var(--lime)]"
              >
                {label}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <p className="max-w-[17rem] text-center text-[10px] leading-[1.45] font-medium text-white/45">
          Tap and say it instead — <span className="text-white/60">{VOICE_EXAMPLE}</span>
        </p>
      )}
    </div>
  );
}

/* ── Presentational: single-page commitment form (used by StoryIntro & AdaptiveReprompt) ── */

export function StoryCommitmentMatrix({
  value,
  onChange,
}: {
  value: StoryCommitment;
  onChange: (patch: Partial<StoryCommitment>) => void;
}) {
  const days = safeDays(value.reclaimConfigs?.[value.reclaimSlot]?.days ?? value.weekDays);
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
      {/* Hero — annual time reclaimed + day rail */}
      <Panel tone="lime" ariaLabel="Annual time reclaimed" className="mt-3">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-cyan-500/10 blur-[70px]"
        />
        <div className="relative flex items-start justify-between gap-[10px]">
          <span
            className={cn(
              "flex items-start gap-2 text-[9px] font-semibold uppercase leading-[1.45] tracking-[0.16em] text-muted-foreground",
            )}
          >
            <Hourglass size={13} className="mt-px flex-none text-[var(--lime)]" />
            <span>
              Annual time
              <br />
              reclaimed
            </span>
          </span>
          <span className="inline-flex flex-none items-center gap-[6px] rounded-full border border-[var(--lime-30)] bg-[var(--lime-08)] px-2.5 py-1.5  text-[8.5px] font-bold uppercase leading-[1.4] tracking-[0.12em] text-[var(--lime)]">
            <Zap size={11} />
            <span>
              Speed booster
              <br />+{Math.min(60, Math.round((mins / 30) * 25))}%
            </span>
          </span>
        </div>

        <p className="relative my-2 flex items-baseline gap-2 whitespace-nowrap" aria-live="polite">
          <b
            className={cn(
              "text-[clamp(26px,8vw,34px)] font-bold leading-none tracking-[-0.02em] text-[var(--lime)] tabular-nums",
            )}
            style={{ textShadow: "0 0 24px var(--lime-40)" }}
          >
            +{shownHours}
          </b>
          <span className={cn("text-[11px] font-semibold tracking-[0.1em] text-white/80")}>
            HOURS / YEAR
          </span>
        </p>

        {/* day decompiler rail — lit span scales with daily minutes */}
        <DayRail value={value} spanMin={mins} />

        <div className="relative flex items-center justify-between gap-2  text-[10px] leading-[1.4]">
          <span className="text-[var(--cyan)]">
            <Dot color={CYAN} small /> +{weeklyHours.toFixed(2)} hrs/week converted
          </span>
          <span className="text-white/60">Compounding daily</span>
        </div>

        <div
          className="relative mt-2 h-[6px] overflow-hidden rounded-full bg-white/[0.08]"
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
              background: `linear-gradient(90deg, ${CYAN}, ${LIME})`,
              boxShadow: "0 0 10px var(--lime-50)",
              transition: "width 300ms ease",
            }}
          />
        </div>
      </Panel>

      {/* Daily practice module */}
      <SectionHead right="Core multiplier" icon={<Timer size={12} />} title="Daily practice" />
      <Panel tone="lime" ariaLabel="Daily practice" className="mt-3 p-3.5">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full border",
              toneChip.lime,
            )}
          >
            <Timer className="size-4" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className={cn("text-[13px] font-semibold leading-tight text-foreground")}>
              Sprint session
            </h3>
            <p className="mt-0.5 text-[9px] font-medium text-[var(--lime)]">
              {sprints} {sprints === 1 ? "sprint" : "sprints"} × {Math.round(mins / sprints)} min
              blocks
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

        {/* sprint blocks rail — also scales with minutes */}
        <div className="mt-3 flex items-end gap-[3px]" aria-hidden>
          {Array.from({ length: sprints }, (_, i) => (
            <span
              key={i}
              className="flex-1 rounded-t-[3px]"
              style={{
                height: `${16 + ((i * 3) % 9)}px`,
                background: `linear-gradient(180deg, ${i === sprints - 1 ? LIME : LIME_40}, ${i === sprints - 1 ? LIME_133 : LIME_067})`,
                transition: "height 300ms ease",
              }}
            />
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
          <span
            className={cn(
              "inline-flex flex-none items-center text-[9px] font-medium uppercase tracking-[0.12em] text-white/60",
            )}
          >
            Remind at:
          </span>
          <Sel
            label="Daily reminder time"
            value={value.reminderTime}
            onChange={(v) => onChange({ reminderTime: v })}
            flex
          />
        </div>
      </Panel>

      {/* Reclaim modules */}
      <SectionHead right="Where it hides" icon={<Layers size={12} />} title="Dead-time presets" />
      <ReclaimPanel value={value} onChange={onChange} />

      {/* Dynamic formula */}
      <Panel tone="cyan" ariaLabel="Dynamic practice formula" className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span
            className={cn(
              "flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground",
            )}
          >
            <Sigma size={12} className="flex-none text-[var(--lime)]" />
            Dynamic formula
          </span>
          <span
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--cyan)]",
            )}
          >
            <Dot color={CYAN} small pulse /> Live parser
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2" aria-live="polite">
          <span className="rounded-md border border-cyan-400/50 bg-cyan-400/10 px-2.5 py-1.5  text-[10px] font-bold tracking-[0.03em] text-[var(--cyan)]">
            {sprints} {sprints === 1 ? "Stack" : "Stacks"} configured
          </span>
          <span className=" text-[11px] font-medium text-white/60">=</span>
          <span className="rounded-md border border-[var(--lime-40)] bg-[var(--lime-10)] px-2.5 py-1.5  text-[10px] font-bold tracking-[0.03em] text-[var(--lime)]">
            {mins} min/day
          </span>
        </div>
        <p className="mt-2.5 text-[10px] leading-[1.4] font-medium text-white/80">
          daily practice compounded across {daysActive} day{daysActive === 1 ? "" : "s"} a week
        </p>
        <span className="mt-2 inline-block rounded-md border border-[var(--lime-40)] bg-[var(--lime-08)] px-2.5 py-1.5  text-[10px] font-bold tracking-[0.03em] text-[var(--lime)]">
          {weekdayLabel(weeklyMin)} reclaimed
        </span>
        <p className="mt-2.5  flex items-center gap-1.5 text-[9.5px] leading-[1.3] text-[var(--cyan)]">
          <Dot color={CYAN} small /> Reminder + trigger notifications primed
        </p>
      </Panel>

      {/* Trigger decoder */}
      <Panel tone="fuchsia" ariaLabel="Trigger decoder" className="mt-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full border",
              toneChip.fuchsia,
            )}
          >
            <Brain className="size-4" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                "flex items-center gap-1.5 text-[12px] font-semibold leading-tight text-foreground",
              )}
            >
              Trigger Decoder
              <span className="rounded bg-fuchsia-400/15 px-1.5 py-0.5  text-[8px] font-bold uppercase tracking-[0.08em] text-[var(--fuchsia)]">
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
                    "rounded-md border px-2 py-1  text-[8.5px] font-bold uppercase tracking-[0.05em] transition-colors",
                    value.triggerType === tr
                      ? "border-fuchsia-400/55 bg-fuchsia-400/15 text-[var(--fuchsia)]"
                      : "border-white/[0.08] text-white/70",
                  )}
                >
                  {tr}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
          <span
            className={cn(
              "inline-flex flex-none items-center text-[9px] font-medium uppercase tracking-[0.12em] text-white/60",
            )}
          >
            Trigger at:
          </span>
          <Sel
            label="Trigger time"
            value={value.triggerTime}
            onChange={(v) => onChange({ triggerTime: v })}
            flex
          />
        </div>
      </Panel>

      <VoiceCommitmentBar value={value} onChange={onChange} />
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

export function StoryIntro({
  onClose,
  preloaded = false,
}: {
  onClose: () => void;
  preloaded?: boolean;
}) {
  const store = useOnboardingStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const theme = useThemeStore((s) => s.theme);

  const [value, setValue] = useState<StoryCommitment>(() => {
    const stored = store.weekDays;
    const week =
      stored && stored.length === 7
        ? stored
        : Array.from({ length: 7 }, (_, i) => stored?.[i] ?? true);
    return {
      dailyMinutes: store.dailyMinutes ?? 30,
      reminderTime: store.reminderTime || "00:00",
      reclaimSlot: store.reclaimSlot,
      reclaimWindow: store.reclaimWindow || "00:00 - 00:00",
      reclaimConfigs: store.reclaimConfigs,
      triggerType: store.triggerType,
      triggerTime: store.triggerTime || "00:00",
      weekDays: week,
    };
  });

  useLayoutEffect(() => {
    if (preloaded) return;
    if (overlayRef.current) {
      const el = overlayRef.current;
      el.animate([{ transform: "translateX(100%)" }, { transform: "translateX(0%)" }], {
        duration: 320,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
    }
  }, [preloaded]);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const closingRef = useRef(false);
  const [notifError, setNotifError] = useState<string | null>(null);

  const animateOut = useCallback(() => {
    const done = () => onCloseRef.current();
    const el = overlayRef.current;
    if (!el) return done();
    el.animate([{ transform: "translateX(0%)" }, { transform: "translateX(-100%)" }], {
      duration: 280,
      easing: "cubic-bezier(0.55, 0, 0.55, 0.2)",
      fill: "forwards",
    }).addEventListener("finish", done, { once: true });
  }, []);

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
    store.setReclaimConfigs(value.reclaimConfigs ?? store.reclaimConfigs);
    void applyStoryNotifications(value).then((res) => {
      if (res.requested && !res.scheduled) {
        setNotifError(
          res.granted
            ? "Reminders couldn't be scheduled. You can turn them on in Settings."
            : "Notifications are blocked, so reminders won't be sent. Allow them in your browser or device settings.",
        );
        closingRef.current = false;
        return;
      }
      animateOut();
    });
  }, [value, store, animateOut]);

  return createPortal(
    <MotionConfig reducedMotion="user">
      <div
        ref={overlayRef}
        data-theme-scope
        className={cn(
          "fixed inset-0 z-[var(--z-intro)] overflow-x-hidden overflow-y-auto sm:flex sm:items-center sm:justify-center sm:overflow-hidden sm:bg-black/60 sm:backdrop-blur-sm",
          preloaded && "invisible pointer-events-none",
          theme === "light" && "light",
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={preloaded || undefined}
      >
        <div
          className="relative w-full min-h-full sm:min-h-0 sm:max-w-md sm:max-h-[90vh] sm:flex sm:flex-col sm:overflow-hidden sm:rounded-3xl sm:border sm:border-white/[0.06] sm:shadow-2xl"
          style={{
            background: "linear-gradient(180deg, var(--screen-tint) 0%, var(--overlay-solid) 100%)",
          }}
        >
          {/* ambient glows */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[300px] w-[440px] rounded-full opacity-15"
            style={{ background: `radial-gradient(circle, ${CYAN_251}, transparent 70%)` }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, var(--lime-40), transparent)",
            }}
          />

          <div className="relative mx-auto w-full max-w-[430px] px-[14px] pb-[24px] sm:min-h-0 sm:max-w-none sm:flex-1 sm:overflow-y-auto sm:px-6 max-[359px]:px-3">
            <div className="relative flex flex-col">
            {/* Protocol pill */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center pt-[max(1rem,var(--sat))]"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-4 py-1.5 backdrop-blur-sm">
                <Sparkles size={12} className="text-[var(--lime)]" />
                <span
                  className={cn("text-[11px] font-semibold tracking-[0.22em] text-[var(--lime-85)]")}
                >
                  DECODE YOUR DAY
                </span>
              </div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col pb-4"
            >
              <motion.p
                variants={itemVariants}
                className="mb-4 mt-3 text-center text-[12px] font-medium text-white/50"
              >
                Shape the plan around the life you already live.
              </motion.p>

              <motion.div variants={itemVariants}>
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
            className="absolute right-[14px] top-[14px] z-10 text-[10px] font-bold uppercase tracking-[0.14em] text-white/50 transition-colors hover:text-white/70 active:scale-95"
          >
            Skip
          </button>

          {notifError && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-[10.5px] font-medium leading-relaxed text-amber-200"
            >
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              <span>{notifError}</span>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 280, damping: 28 }}
            className="relative mt-6"
          >
            <button
              type="button"
              onClick={close}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 py-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--on-accent)] transition-transform active:scale-[0.98]"
              style={{
                background: `linear-gradient(90deg, ${LIME}, ${LIME_LIGHT})`,
                boxShadow:
                  "0 10px 34px var(--lime-25), 0 1px 0 var(--glass-25) inset",
              }}
            >
              <span className="relative flex items-center gap-2.5">
                <Lock size={14} strokeWidth={3} />
                Start configuring
              </span>
            </button>
            <p className="mt-2.5 text-center text-[10px] font-medium text-white/35">
              You can adjust all of this anytime in Settings.
            </p>
          </motion.div>
          </div>
        </div>
      </div>
    </MotionConfig>,
    document.body,
  );
}
