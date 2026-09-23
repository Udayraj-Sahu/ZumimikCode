"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Calendar,
  Crosshair,
  Flame,
  Radar,
  Swords,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { DOMAIN_LABELS } from "@/lib/types/template";
import { useDashboardData } from "@/hooks/queries/use-dashboard";

const ACCENT = "#C8FF4D";

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

function useCountUp(target: number, ms = 900) {
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

/* ── Enter + exit choreography ── */

function FadeUp({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.animate(
      [
        { opacity: 0, transform: "translateY(14px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 550,
        delay,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "backwards",
      },
    );
  }, [delay]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-black/25",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(200,255,77,0.4), transparent)",
        }}
      />
      {children}
    </section>
  );
}

export function ArenaIntro({
  onClose,
  preloaded = false,
}: {
  onClose: () => void;
  preloaded?: boolean;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
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

  useLayoutEffect(() => {
    if (preloaded) return;
    document.body.style.overflow = "hidden";
    if (overlayRef.current) {
      overlayRef.current.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 320,
        easing: "ease-out",
        fill: "forwards",
      });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaded]);

  const exit = useCallback((cb: () => void) => {
    if (closingRef.current) return;
    closingRef.current = true;
    const el = overlayRef.current;
    const done = () => cb();
    if (!el) return done();
    el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 220,
      easing: "ease-in",
      fill: "forwards",
    }).addEventListener("finish", done, { once: true });
  }, []);

  const label = (id: string) => DOMAIN_LABELS[id] ?? id.toUpperCase();

  const lanes: {
    id: string;
    title: string;
    desc: string;
    Icon: typeof Zap;
    tone: string;
    badge: string;
  }[] = [];

  if (primary) {
    lanes.push({
      id: primary,
      title: `Lane 01 · ${label(primary)} Quant`,
      desc: "Full syllabus, predictive percentile, timed drills",
      Icon: TrendingUp,
      tone: "text-[#C8FF4D] border-[#C8FF4D]/40 bg-[#C8FF4D]/10",
      badge: "LIVE",
    });
  }
  if (speedLane) {
    lanes.push({
      id: "vedic",
      title: "Lane 02 · Vedic Speed Math",
      desc: "Mental arithmetic bursts and reflex sprints",
      Icon: Zap,
      tone: "text-cyan-300 border-cyan-400/40 bg-cyan-400/10",
      badge: "LIVE",
    });
  }
  if (second) {
    lanes.push({
      id: second,
      title: `Lane 03 · ${label(second)}`,
      desc: "Parallel prep lane synced to the same arena clock",
      Icon: Swords,
      tone: "text-fuchsia-300 border-fuchsia-400/40 bg-fuchsia-400/10",
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
      className={cn(
        "fixed inset-0 z-[210] overflow-y-auto",
        preloaded && "invisible pointer-events-none",
      )}
      style={{
        background: "radial-gradient(130% 90% at 50% 0%, #10140e 0%, #0a0b08 48%, #070907 100%)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="arena-hook-title"
    >
      {/* ambient glow + hairline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-90px] h-56 w-56 -translate-x-1/2 rounded-full bg-[#C8FF4D]/[0.12] blur-[95px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(200,255,77,0.4), transparent)",
        }}
      />

      <div className="relative mx-auto min-h-full w-full max-w-[400px] px-5 pb-8 pt-8">
        {/* centered brand */}
        <FadeUp className="flex justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#C8FF4D]/25 bg-[#C8FF4D]/[0.07] px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C8FF4D] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C8FF4D]" />
            </span>
            <span className="text-[11px] font-bold tracking-[0.22em] text-[#C8FF4D]">ARENA</span>
          </div>
        </FadeUp>

        {/* hero */}
        <FadeUp delay={80} className="mt-5 text-center">
          <h1
            id="arena-hook-title"
            className="text-[36px] font-extrabold uppercase leading-[0.98] tracking-tight text-foreground"
          >
            The arena is{" "}
            <span
              className="text-transparent"
              style={{
                background: "linear-gradient(90deg, #C8FF4D, #e8ffb0)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }}
            >
              live.
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-[320px] text-[12.5px] leading-relaxed text-muted-foreground/80">
            Your training is checkpointed to{" "}
            <span className="font-semibold text-foreground">{label(primary)}</span>
            {speedLane ? <span className="text-cyan-300">, plus a Vedic speed lane</span> : ""}.
            Everything below is pulled straight from your arena — not a demo.
          </p>
        </FadeUp>

        {/* live stat tiles */}
        <FadeUp delay={160} className="mt-6">
          <Panel className="p-2.5">
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
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[8.5px] font-bold tracking-[0.18em] text-muted-foreground/60">
            <Flame size={10} className="text-[#C8FF4D]" />
            {lanes.length} LANE{lanes.length > 1 ? "S" : ""} ACTIVE • LIVE TELEMETRY
          </p>
        </FadeUp>

        {/* live lanes */}
        <FadeUp delay={240} className="mt-4 space-y-2.5">
          {lanes.map(({ id, title, desc, Icon, tone }) => (
            <div
              key={id}
              className="flex items-center gap-3 rounded-[20px] border border-white/[0.08] bg-black/25 p-3.5"
            >
              <span
                className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl border", tone)}
              >
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold leading-snug text-foreground">{title}</div>
                <div className="mt-0.5 text-[10px] leading-snug text-muted-foreground/70">
                  {desc}
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-[#C8FF4D]/40 bg-[#C8FF4D]/10 px-2 py-0.5 text-[8px] font-bold tracking-wider text-[#C8FF4D]">
                LIVE
              </span>
            </div>
          ))}
        </FadeUp>

        {/* skill radar */}
        {radar.length > 0 && (
          <FadeUp delay={320} className="mt-4">
            <Panel className="p-3.5">
              <div className="mb-2.5 flex items-center gap-1.5 text-[9px] font-bold tracking-[0.2em] text-[#C8FF4D]">
                <Radar size={11} /> SKILL RADAR
              </div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
                {radar.map((axis) => (
                  <div key={axis.label} className="flex items-center gap-2">
                    <span className="w-[54px] text-[9.5px] text-muted-foreground/70">
                      {axis.label}
                    </span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round(axis.value * 100)}%`,
                          background: "linear-gradient(90deg, #C8FF4D33, #C8FF4D)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </FadeUp>
        )}

        {/* domain mastery */}
        {topics.length > 0 && (
          <FadeUp delay={380} className="mt-4">
            <Panel className="p-3.5">
              <div className="mb-2.5 text-[9px] font-bold tracking-[0.2em] text-[#C8FF4D]">
                {label(primary).toUpperCase()} MASTERY MAP
              </div>
              <ul className="space-y-2">
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
                          background: `linear-gradient(90deg, ${ACCENT}33, ${ACCENT})`,
                        }}
                      />
                    </div>
                    <span className="w-7 text-right text-[9px] text-[#C8FF4D] tabular-nums">
                      {tp.value}%
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </FadeUp>
        )}

        {/* up next */}
        {upcoming.length > 0 && (
          <FadeUp delay={440} className="mt-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.2em] text-muted-foreground/70">
                <Calendar size={11} /> UP NEXT
              </div>
              {upcoming.slice(0, 2).map((ev) => (
                <div
                  key={ev.title}
                  className="flex items-center justify-between rounded-[16px] border border-white/[0.07] bg-white/[0.02] px-3 py-2.5"
                >
                  <span className="flex-1 truncate text-[11px] text-foreground/90">{ev.title}</span>
                  <span className="mr-2 text-[9.5px] text-muted-foreground/70">{ev.time}</span>
                  <span className="rounded border border-[#C8FF4D]/40 bg-[#C8FF4D]/10 px-1.5 py-0.5 text-[8px] font-bold text-[#C8FF4D]">
                    {ev.tag}
                  </span>
                </div>
              ))}
            </div>
          </FadeUp>
        )}

        {/* CTA */}
        <FadeUp delay={500} className="mt-6">
          <button
            onClick={() => exit(onClose)}
            className="flex w-full items-center justify-center gap-2 rounded-[18px] py-4 text-[12px] font-bold tracking-[0.12em] text-[#0A0C0A] transition hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "linear-gradient(90deg, #C8FF4D, #B9F45C)",
              boxShadow: "0 10px 34px rgba(163,230,53,0.25), 0 1px 0 rgba(255,255,255,0.25) inset",
            }}
          >
            ENTER {lanes.length > 1 ? "MULTI-LANE" : "YOUR"} ARENA
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => exit(onClose)}
            className="mx-auto mt-3 block text-[10px] text-muted-foreground/50 underline-offset-2 transition-colors hover:text-muted-foreground hover:underline"
          >
            Continue to dashboard
          </button>
        </FadeUp>
      </div>
    </div>,
    document.body,
  );
}
