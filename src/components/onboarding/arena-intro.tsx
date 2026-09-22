"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Calendar,
  Crosshair,
  Flame,
  Radar,
  Swords,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { DOMAIN_LABELS } from "@/lib/types/template";
import { useDashboardData } from "@/hooks/queries/use-dashboard";

const ACCENT = "#C8FF4D";

type Tone = "lime" | "cyan" | "violet";

const TONES: Record<Tone, { card: string; tile: string; badge: string }> = {
  lime: {
    card: "border-[#C8FF4D]/40 bg-[#C8FF4D]/[0.04]",
    tile: "border-[#C8FF4D]/40 bg-[#C8FF4D]/10 text-[#C8FF4D]",
    badge: "border-[#C8FF4D]/50 bg-[#C8FF4D]/10 text-[#C8FF4D]",
  },
  cyan: {
    card: "border-cyan-400/40 bg-cyan-400/[0.04]",
    tile: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
    badge: "border-cyan-400/50 bg-cyan-400/10 text-cyan-300",
  },
  violet: {
    card: "border-fuchsia-400/40 bg-fuchsia-400/[0.04]",
    tile: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
    badge: "border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-300",
  },
};

const toneHex: Record<Tone, string> = {
  lime: ACCENT,
  cyan: "#22D3EE",
  violet: "#E879F9",
};

/* ── Using real dashboard data (mock service, backend drop-in) ── */

function useLanes() {
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const activePreps = useOnboardingStore((s) => s.activePreps);
  const planLane = useOnboardingStore((s) => s.planLane);
  const isVedic = targetExam === "vedic-math";

  const primary = planLane || targetExam || activePreps[0] || "cat";
  const others = activePreps.filter((p) => p !== primary && p !== "vedic-math");
  const hasSpeed = isVedic || activePreps.includes("vedic-math");

  return {
    primary,
    speedLane: hasSpeed,
    second: others[0],
  };
}

/* ── Tween for the hero counters ── */

function useCountUp(target: number, ms = 800) {
  const ref = useRef({ target: 0, node: null as HTMLSpanElement | null });
  const setNode = useCallback((node: HTMLSpanElement | null) => {
    if (!node || ref.current.node === node) return;
    ref.current.node = node;
    node.textContent = "0";
  }, []);

  useEffect(() => {
    ref.current.target = target;
    const node = ref.current.node;
    if (!node) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      node.textContent = String(Math.round(ref.current.target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);

  return setNode;
}

/* ── Corner-bracket panel ── */

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
  return (
    <section
      aria-label={ariaLabel}
      className={cn("relative overflow-hidden rounded-2xl border bg-black/25", className)}
      style={{ borderColor: `${hex}22` }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${hex}77, transparent)` }}
      />
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

export function ArenaIntro({ onClose }: { onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  const { primary, speedLane, second } = useLanes();
  const { data } = useDashboardData(primary);

  const setAcc = useCountUp(data?.stats.accuracy ?? 0);
  const setQuestions = useCountUp(data?.stats.questions ?? 0);
  const setPercentile = useCountUp(data?.stats.percentile ?? 0);
  const setSpeed = useCountUp(data?.stats.speed ?? 0);

  const radar = data?.radarAxes ?? [];
  const upcoming = data?.upcoming ?? [];
  const topics = data?.topics ?? [];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    if (sheetRef.current) {
      sheetRef.current.animate(
        [{ transform: "translateY(100%)" }, { transform: "translateY(0%)" }],
        {
          duration: 460,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
      );
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const exit = useCallback((cb: () => void) => {
    if (closingRef.current) return;
    closingRef.current = true;
    const sheet = sheetRef.current;
    if (!sheet) return cb();
    sheet
      .animate([{ transform: "translateY(0%)" }, { transform: "translateY(100%)" }], {
        duration: 220,
        easing: "cubic-bezier(0.4, 0, 1, 1)",
        fill: "forwards",
      })
      .addEventListener(
        "finish",
        () => {
          overlayRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 160,
            easing: "ease-in",
          });
          setTimeout(cb, 140);
        },
        { once: true },
      );
  }, []);

  const label = (id: string) => DOMAIN_LABELS[id] ?? id.toUpperCase();

  const lanes: {
    id: string;
    title: string;
    desc: string;
    Icon: typeof Zap;
    tone: Tone;
    badge: string;
  }[] = [];

  if (primary) {
    lanes.push({
      id: primary,
      title: `Lane 01 · ${label(primary)} Quant`,
      desc: "Full syllabus, predictive percentile, timed drills",
      Icon: TrendingUp,
      tone: "lime",
      badge: "LIVE",
    });
  }
  if (speedLane) {
    lanes.push({
      id: "vedic",
      title: "Lane 02 · Vedic Speed Math",
      desc: "Mental arithmetic bursts and reflex sprints",
      Icon: Zap,
      tone: "cyan",
      badge: "LIVE",
    });
  }
  if (second) {
    lanes.push({
      id: second,
      title: `Lane 03 · ${label(second)}`,
      desc: "Parallel prep lane synced to the same arena clock",
      Icon: Swords,
      tone: "violet",
      badge: "LIVE",
    });
  }

  const statCells = [
    { label: "Accuracy", value: setAcc, suffix: "%", Icon: Crosshair },
    { label: "Questions", value: setQuestions, suffix: "", Icon: Radar },
    { label: "Percentile", value: setPercentile, suffix: "", Icon: TrendingUp },
    { label: "Speed Index", value: setSpeed, suffix: "", Icon: Zap },
  ];

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[210] overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(8,10,8,0.99) 0%, rgba(12,15,11,0.99) 100%)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="arena-hook-title"
    >
      {/* twisted arena backdrop — grid + racing diagonals */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(200,255,77,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(200,255,77,0.5) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        aria-hidden
        className="absolute -top-24 right-[-20%] h-72 w-[130%] rotate-[-8deg]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(200,255,77,0.10), transparent)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-[38%] h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.35), transparent)",
        }}
      />

      {/* hero */}
      <div className="relative px-5 pt-10">
        <div className="flex items-center justify-between text-[9px] font-bold tracking-[0.24em] text-muted-foreground/70">
          <span>LIVE CONCURRENCY MATRIX</span>
          <span className="flex items-center gap-1.5 text-[#C8FF4D]">
            <Flame size={10} /> {lanes.length} LANE{lanes.length > 1 ? "S" : ""} ACTIVE
          </span>
        </div>

        <h1
          id="arena-hook-title"
          className="mt-3 text-[38px] font-extrabold uppercase leading-[0.92] tracking-tight text-foreground"
        >
          Enter the
          <br />
          <span className="relative inline-block skew-x-[-6deg]">
            <span
              aria-hidden
              className="absolute inset-0 translate-x-[2.5px] text-[#C8FF4D]/40 skew-x-[-6deg]"
              style={{ clipPath: "inset(0 0 38% 0)" }}
            >
              Exam Arena
            </span>
            <span
              className="relative inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(100deg, #C8FF4D 20%, #e8ffb0 55%, #C8FF4D 85%)",
              }}
            >
              Exam Arena
            </span>
          </span>
        </h1>

        <p className="mt-4 max-w-[320px] text-[12.5px] leading-relaxed text-muted-foreground/80">
          Your preparation is checkpointed to{" "}
          <span className="font-semibold text-foreground">{label(primary)}</span>
          {speedLane ? <span className="text-cyan-300">, plus a Vedic speed lane</span> : ""}. Live
          telemetry below is pulled straight from the arena, not from a demo card.
        </p>
      </div>

      {/* clearance sheet */}
      <div
        ref={sheetRef}
        className="absolute inset-x-0 bottom-0 max-h-[72%] overflow-y-auto rounded-t-3xl border-t bg-[#0a0a0d] px-4 pb-6 pt-4"
        style={{ borderColor: `${ACCENT}40`, boxShadow: `0 -12px 40px rgba(163,230,53,0.12)` }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />

        {/* header */}
        <header className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.22em] text-muted-foreground">
            ARENA CLEARANCE PANEL
          </span>
          <button
            aria-label="Close"
            onClick={() => exit(onClose)}
            className="text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </header>

        {/* real stats */}
        <Panel tone="lime" ariaLabel="Live arena stats" className="mt-3">
          <div className="grid grid-cols-4 divide-x divide-white/[0.06]">
            {statCells.map(({ label: l, value, suffix, Icon }) => (
              <div key={l} className="px-2 first:pl-1">
                <Icon size={12} className="text-[#C8FF4D]" />
                <div className="mt-2 text-[17px] font-bold text-foreground tabular-nums">
                  <span ref={value} />
                  {suffix}
                </div>
                <div className="mt-0.5 text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* real lanes */}
        <ul className="mt-3 space-y-2.5">
          {lanes.map(({ id, title, desc, Icon, tone, badge }) => {
            const t = TONES[tone];
            return (
              <li key={id} className={cn("flex items-center gap-3 rounded-xl border p-3", t.card)}>
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-lg border",
                    t.tile,
                  )}
                >
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-bold leading-snug text-foreground">{title}</div>
                  <div className="mt-0.5 text-[10px] leading-snug text-muted-foreground/70">
                    {desc}
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded border px-1.5 py-1 text-center text-[8px] font-bold tracking-wider",
                    t.badge,
                  )}
                >
                  {badge}
                </span>
              </li>
            );
          })}
        </ul>

        {/* real radar */}
        {radar.length > 0 && (
          <Panel tone="cyan" ariaLabel="Skill radar" className="mt-3 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-[9px] font-bold tracking-[0.2em] text-cyan-300">
              <Radar size={11} /> SKILL RADAR
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-2">
              {radar.map((axis) => (
                <div key={axis.label} className="flex items-center gap-2">
                  <span className="w-[52px] text-[9.5px] text-muted-foreground/70">
                    {axis.label}
                  </span>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round(axis.value * 100)}%`,
                        background: "linear-gradient(90deg, #22D3EE33, #22D3EE)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {/* real topics */}
        {topics.length > 0 && (
          <Panel tone="violet" ariaLabel="Domain mastery" className="mt-3 p-3">
            <div className="mb-2 text-[9px] font-bold tracking-[0.2em] text-fuchsia-300">
              {label(primary).toUpperCase()} MASTERY MAP
            </div>
            <ul className="space-y-1.5">
              {topics.slice(0, 4).map((tp) => (
                <li key={tp.name} className="flex items-center gap-2">
                  <span className="flex-1 truncate text-[9.5px] text-muted-foreground/80">
                    {tp.name}
                  </span>
                  <div className="h-1 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${tp.value}%`,
                        background: `linear-gradient(90deg, ${toneHex.violet}33, ${toneHex.violet}${Math.round(tp.value)}`,
                      }}
                    />
                  </div>
                  <span className="w-7 text-right text-[9px] text-fuchsia-200/90 tabular-nums">
                    {tp.value}%
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {/* real streak + upcoming */}
        {upcoming.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.2em] text-muted-foreground/70">
              <Calendar size={11} /> UP NEXT
            </div>
            {upcoming.slice(0, 2).map((ev) => (
              <div
                key={ev.title}
                className="flex items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2"
              >
                <span className="flex-1 truncate text-[11px] text-foreground/90">{ev.title}</span>
                <span className="mr-2 text-[9.5px] text-muted-foreground/70">{ev.time}</span>
                <span className="rounded border border-[#C8FF4D]/40 bg-[#C8FF4D]/10 px-1.5 py-0.5 text-[8px] font-bold text-[#C8FF4D]">
                  {ev.tag}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => exit(onClose)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[12px] font-bold tracking-wider text-[#0A0C0A] transition hover:brightness-110 active:scale-[0.98]"
          style={{
            background: "linear-gradient(90deg, #C8FF4D, #B9F45C)",
            boxShadow: "0 0 28px rgba(163,230,53,0.35), 0 1px 0 rgba(255,255,255,0.25) inset",
          }}
        >
          ENTER MULTI-LANE ARENA
          <ArrowRight size={14} />
        </button>

        <button
          onClick={() => exit(onClose)}
          className="mx-auto mt-3 block text-[10px] text-muted-foreground/60 underline-offset-2 hover:text-muted-foreground hover:underline transition-colors"
        >
          Continue to dashboard
        </button>
      </div>
    </div>,
    document.body,
  );
}
