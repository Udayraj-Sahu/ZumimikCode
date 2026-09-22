"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, type Variants } from "motion/react";
import { BrainCircuit, Clock, Crosshair, Timer, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT = "#C8FF4D";

type Variant = "this_year" | "whenever" | "not_sure" | "vedic";

type Tone = "lime" | "cyan" | "fuchsia";

const iconTones: Record<Tone, string> = {
  lime: "border-[#C8FF4D]/50 bg-[#C8FF4D]/10 text-[#C8FF4D]",
  cyan: "border-cyan-400/50 bg-cyan-400/10 text-cyan-400",
  fuchsia: "border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-400",
};

type System = {
  icon: typeof BrainCircuit;
  tone: Tone;
  title: string;
  tag: string;
  body: string;
};

const SYSTEMS: System[] = [
  {
    icon: BrainCircuit,
    tone: "lime",
    title: "Adaptive Neural Engine",
    tag: "Real-time calibration",
    body: "Dynamic difficulty adjusts per millisecond. Automatically isolates speed traps and reinforces lagging formulas before test day.",
  },
  {
    icon: Clock,
    tone: "cyan",
    title: "Automated Daily Practice",
    tag: "15 min / day protocol",
    body: "Curated daily micro-drills pushed directly to your routine. Zero decision fatigue—just open and execute.",
  },
  {
    icon: Crosshair,
    tone: "fuchsia",
    title: "Weak-Spot Diagnostics",
    tag: "Error pattern scan",
    body: "Every miss is tagged by topic and speed. Your weakest areas move to the front of tomorrow's drill queue.",
  },
  {
    icon: Timer,
    tone: "lime",
    title: "Unlimited Mock Arena",
    tag: "Test-day simulation",
    body: "Full-length timed mocks on demand, online or offline, scored the way the real exam scores you.",
  },
];

const STATS = [
  { value: "+32%", label: "Speed velocity", valueClass: "text-[#C8FF4D]" },
  { value: "99.4%", label: "Projected accuracy", valueClass: "text-[#C8FF4D]" },
  { value: "0", label: "Brain fog", valueClass: "text-fuchsia-400" },
];

const VARIANT_COPY: Record<
  Variant,
  { pill: string; headline: { text: string; accent: string }; sub: string; caption: string }
> = {
  this_year: {
    pill: "DEADLINE PROTOCOL",
    headline: { text: "Unfair prep. Zero friction.", accent: "Engineered for exam day." },
    sub: "Your test date is locked in. Neon-grade prep automates daily drill volume and diagnoses weak spots so every working day compounds toward it.",
    caption: "Includes automated daily drills, unlimited mocks & offline mode.",
  },
  whenever: {
    pill: "ADAPTIVE PROTOCOL",
    headline: { text: "Unfair prep. Zero friction.", accent: "Engineered around your pace." },
    sub: "No exam clock forcing the schedule. The engine builds effortless calculation instincts on your own timeline—compound when you can, pause when you must.",
    caption: "Includes automated daily drills, unlimited mocks & offline mode.",
  },
  not_sure: {
    pill: "ADAPTIVE PROTOCOL",
    headline: { text: "Unfair prep. Zero friction.", accent: "Engineered around your pace." },
    sub: "No exam clock forcing the schedule. The engine builds effortless calculation instincts on your own timeline—compound when you can, pause when you must.",
    caption: "Includes automated daily drills, unlimited mocks & offline mode.",
  },
  vedic: {
    pill: "SPEED PROTOCOL",
    headline: { text: "Unfair prep. Zero friction.", accent: "Engineered for lightning recall." },
    sub: "Rapid mental arithmetic rewires your baseline. The engine tracks micro speed, isolates slowness, and compounds recall until answers arrive before you finish reading them.",
    caption: "Includes automated daily drills, unlimited mocks & offline mode.",
  },
};

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
};

type Props = {
  variant: Variant;
  onDone: () => void;
  onClose: () => void;
};

export function FeatureIntro({ variant, onDone, onClose }: Props) {
  const copy = VARIANT_COPY[variant];
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current) return;
    const el = overlayRef.current;
    el.animate([{ transform: "translateX(100%)" }, { transform: "translateX(0%)" }], {
      duration: 320,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    });
  }, []);

  const exitingRef = useRef(false);
  const exit = useCallback(
    (cb: () => void) => {
      if (exitingRef.current) return;
      exitingRef.current = true;
      const el = overlayRef.current;
      if (!el) return cb();
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "ease-in", fill: "forwards" }).addEventListener(
        "finish",
        cb,
        { once: true },
      );
    },
    [],
  );

  return createPortal(
    <div
      ref={overlayRef}
      onClick={() => exit(onDone)}
      className="fixed inset-0 z-[210] overflow-hidden flex flex-col items-center cursor-pointer"
      style={{ background: "linear-gradient(180deg, rgba(10,12,10,0.99) 0%, rgba(14,17,13,0.99) 100%)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feature-hook-title"
    >
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[440px] h-[320px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #22D3EE40, transparent 70%)" }} />
      <div className="pointer-events-none absolute bottom-[-140px] left-1/2 -translate-x-1/2 w-[360px] h-[280px] rounded-full opacity-[0.13]" style={{ background: `radial-gradient(circle, ${ACCENT}55, transparent 70%)` }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,255,77,0.4), transparent)" }} />

      <div className="relative flex h-full w-full max-w-[360px] flex-col px-5 pb-6">
        {/* Protocol pill */}
        <div className="flex justify-center pt-4 pb-3 shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-4 py-1.5 backdrop-blur-sm"
          >
            <Sparkles size={12} className="text-[#C8FF4D]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C8FF4D]/85">{copy.pill}</span>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 min-h-0 overflow-y-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Hero */}
          <motion.section variants={itemVariants} className="mt-6">
            <h1
              id="feature-hook-title"
              className="text-[clamp(1.15rem,5.3vw,1.4rem)] font-bold uppercase leading-[1.08] tracking-[-0.035em]"
            >
              {copy.headline.text}
              <span className="block" style={{ color: ACCENT }}>
                {copy.headline.accent}
              </span>
            </h1>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{copy.sub}</p>
          </motion.section>

          {/* Core architecture */}
          <motion.section variants={itemVariants} aria-labelledby="core-heading" className="mt-7">
            <div className="flex items-center justify-between">
              <h2 id="core-heading" className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Core architecture
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-400">{SYSTEMS.length} tactical systems</p>
            </div>
            <ul className="mt-3 flex flex-col gap-3">
              {SYSTEMS.map(({ icon: Icon, tone, title, tag, body }) => (
                <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-3">
                    <span className={cn("grid size-10 shrink-0 place-items-center rounded-full border", iconTones[tone])}>
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="flex-1 text-[14px] font-semibold leading-tight">{title}</h3>
                    <span className="font-mono max-w-[7.5rem] rounded bg-white/5 px-2 py-1 text-right text-[9px] uppercase leading-3 tracking-wider text-muted-foreground">
                      {tag}
                    </span>
                  </div>
                  <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground/80">{body}</p>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Speed velocity */}
          <motion.section variants={itemVariants} aria-labelledby="habit-heading" className="mt-8">
            <h2 id="habit-heading" className="text-[clamp(1.15rem,5.3vw,1.4rem)] font-bold uppercase leading-[1.08] tracking-[-0.035em]">
              Automated habit.
              <span className="block" style={{ color: ACCENT }}>
                Compounded speed.
              </span>
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              Adaptive spaced reps and neuro-decay monitoring engineered for frictionless sub-second mental calculations.
            </p>

            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="relative size-14 shrink-0">
                <svg viewBox="0 0 48 48" className="size-full -rotate-90" aria-hidden>
                  <circle cx="24" cy="24" r="20" fill="none" strokeWidth="4" className="stroke-white/10" />
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    strokeWidth="4"
                    strokeLinecap="round"
                    pathLength={100}
                    strokeDasharray={100}
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: 24 }}
                    transition={{ duration: 1.4, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                    className="stroke-[#C8FF4D] drop-shadow-[0_0_4px_rgba(200,255,77,0.7)]"
                  />
                </svg>
                <span className="font-mono absolute inset-0 grid place-items-center text-[11px] font-bold">1.2s</span>
              </div>

              <div className="min-w-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Micro-speed velocity</p>
                <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
                  <span className="text-xl font-bold leading-none">1.2s</span>
                  <span className="text-xs text-foreground/70">/ calculation</span>
                  <span className="font-mono text-[10px] text-[#C8FF4D]">(-0.4s)</span>
                </p>
                <p className="font-mono mt-2 inline-flex items-center gap-1.5 rounded border border-[#C8FF4D]/30 bg-[#C8FF4D]/10 px-2 py-1 text-[9px] uppercase tracking-wider text-[#C8FF4D]">
                  <span aria-hidden className="size-1.5 rounded-full bg-[#C8FF4D]" />
                  Decay shield: active
                </p>
              </div>
            </div>
          </motion.section>

          {/* Mastery telemetry */}
          <motion.section variants={itemVariants} aria-labelledby="telemetry-heading" className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <h2 id="telemetry-heading" className="font-mono flex items-center gap-2 text-[10px] uppercase tracking-[0.16em]">
                <span aria-hidden className="size-1.5 rounded-full bg-[#C8FF4D]" />
                Mastery telemetry
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-400">Verified impact</p>
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2">
              {STATS.map(({ value, label, valueClass }) => (
                <div key={label} className="flex flex-col-reverse justify-end gap-1 rounded-lg border border-white/10 bg-black/60 px-3 py-3">
                  <dt className="font-mono text-[9px] uppercase leading-3 tracking-wider text-muted-foreground">{label}</dt>
                  <dd className={cn("text-xl font-bold leading-none", valueClass)}>{value}</dd>
                </div>
              ))}
            </dl>
          </motion.section>
        </motion.div>
      </div>
    </div>,
    document.body,
  );
}