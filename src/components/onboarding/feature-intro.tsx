"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  MotionConfig,
  useReducedMotion,
  useMotionValue,
  useTransform,
  animate,
  type Variants,
} from "motion/react";
import {
  BrainCircuit,
  ChevronUp,
  Clock,
  Crosshair,
  Timer,
  Sparkles,
  ArrowRight,
} from "lucide-react";
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
    title: "Adaptive Sprints",
    tag: "Difficulty follows you",
    body: "Sprint and quest difficulty tunes to your skill level, so practice stays in the zone where you actually improve.",
  },
  {
    icon: Clock,
    tone: "cyan",
    title: "Daily Practice",
    tag: "Drills that fit your day",
    body: "Set a daily minute target and a reminder slot. The app queues a short drill routine and logs every session to your streak.",
  },
  {
    icon: Crosshair,
    tone: "fuchsia",
    title: "Mastery Analytics",
    tag: "See what to fix next",
    body: "Every answer updates per-topic mastery. Slow or weak topics surface in analytics so the next drill targets them.",
  },
  {
    icon: Timer,
    tone: "lime",
    title: "Mock Tests",
    tag: "Full-length timed papers",
    body: "Exam-style mock papers scored by section. Free attempts and Pro unlocks are handled in one place.",
  },
];

const CARD_SPACING = 96;

function centeredDist(index: number, active: number, count: number) {
  const n = count;
  let dist = (((index - active) % n) + n) % n;
  if (dist > n / 2) dist -= n;
  return dist;
}

function SystemCarousel() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setActive((a) => (a + 1) % SYSTEMS.length), 3200);
    return () => clearInterval(id);
  }, [reduceMotion]);

  if (reduceMotion) {
    return (
      <ul className="mt-3 flex flex-col gap-3">
        {SYSTEMS.map(({ icon: Icon, tone, title, tag, body }) => (
          <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-full border",
                  iconTones[tone],
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="flex-1 text-[14px] font-semibold leading-tight">{title}</h3>
              <span className=" max-w-[7.5rem] rounded bg-white/5 px-2 py-1 text-right text-[9px] uppercase leading-3 tracking-wider text-muted-foreground">
                {tag}
              </span>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground/80">{body}</p>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className="relative mt-3 h-[300px]"
      role="group"
      aria-roledescription="carousel"
      aria-label="Core systems"
    >
      {SYSTEMS.map(({ icon: Icon, tone, title, tag, body }, i) => {
        const dist = centeredDist(i, active, SYSTEMS.length);
        const isCenter = dist === 0;
        const abs = Math.abs(dist);
        const y = isCenter
          ? 0
          : (dist > 0 ? 1 : -1) * (abs === 1 ? CARD_SPACING + 18 : CARD_SPACING * 2);
        const scale = isCenter ? 1 : 0.85;
        const opacity = isCenter ? 1 : 0;
        const z = 40 - abs * 6;

        return (
          <motion.button
            key={title}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`${title}, ${isCenter ? "active" : "select this card"}`}
            aria-current={isCenter ? "true" : undefined}
            animate={{ x: "-50%", y: `calc(-50% + ${y}px)`, scale, opacity, zIndex: z }}
            transition={{ type: "spring", stiffness: 205, damping: 33 }}
            className={cn(
              "absolute inset-x-0 left-1/2 top-1/2 w-[90%] cursor-pointer rounded-2xl border p-4 text-left transition-colors",
              isCenter
                ? "border-[#C8FF4D]/40 bg-[#161a14] shadow-[0_0_40px_rgba(200,255,77,0.15)]"
                : "border-white/10 bg-white/[0.03]",
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-full border",
                  iconTones[tone],
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="flex-1 text-[14px] font-semibold leading-tight">{title}</h3>
              <span className=" max-w-[7.5rem] rounded bg-white/5 px-2 py-1 text-right text-[9px] uppercase leading-3 tracking-wider text-muted-foreground">
                {tag}
              </span>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground/80">{body}</p>
          </motion.button>
        );
      })}

      {/* swipe hint */}
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-50 flex justify-center">
        <div className="flex items-center gap-2">
          <motion.div
            animate={reduceMotion ? {} : { y: [0, -5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-1.5 text-muted-foreground"
          >
            <ChevronUp size={11} className="text-[#C8FF4D]/70" />
            <span className=" text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70">
              Swipe up for more details
            </span>
          </motion.div>
          <span className=" text-[9px] text-muted-foreground/50">
            {active + 1} / {SYSTEMS.length}
          </span>
        </div>
      </div>
    </div>
  );
}

const FACTS: { value: string; label: string; valueClass: string }[] = [
  { value: "5", label: "Exam tracks", valueClass: "text-[#C8FF4D]" },
  { value: "2", label: "Free mock papers", valueClass: "text-cyan-400" },
  { value: "Daily", label: "Drill routine", valueClass: "text-fuchsia-400" },
];

const VARIANT_COPY: Record<
  Variant,
  { pill: string; headline: { text: string; accent: string }; sub: string; caption: string }
> = {
  this_year: {
    pill: "DEADLINE PROTOCOL",
    headline: { text: "Unfair prep. Zero friction.", accent: "Engineered for exam day." },
    sub: "Your test date is locked in. Prep automates daily drill volume and flags weak spots so every working day compounds toward exam day.",
    caption: "Daily drills, timed mocks, and one clear dashboard.",
  },
  whenever: {
    pill: "ADAPTIVE PROTOCOL",
    headline: { text: "Unfair prep. Zero friction.", accent: "Engineered around your pace." },
    sub: "No exam clock forcing the schedule. The engine builds effortless calculation habits on your own timeline, compounding when you can and pausing when you must.",
    caption: "Daily drills, timed mocks, and one clear dashboard.",
  },
  not_sure: {
    pill: "ADAPTIVE PROTOCOL",
    headline: { text: "Unfair prep. Zero friction.", accent: "Engineered around your pace." },
    sub: "No exam clock forcing the schedule. The engine builds effortless calculation habits on your own timeline, compounding when you can and pausing when you must.",
    caption: "Daily drills, timed mocks, and one clear dashboard.",
  },
  vedic: {
    pill: "SPEED PROTOCOL",
    headline: { text: "Unfair prep. Zero friction.", accent: "Engineered for lightning recall." },
    sub: "Rapid mental arithmetic rewires your baseline. The engine tracks your pace, isolates slowness, and compounds recall until answers arrive before you finish reading them.",
    caption: "Speed drills, daily routines, and timed mock practice.",
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

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

function CountValue({ value, className }: { value: string; className?: string }) {
  const isNumber = /^\d+$/.test(value);
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const text = useTransform(count, (v) => Math.round(v).toString());

  useEffect(() => {
    if (!isNumber) return;
    if (reduceMotion) {
      count.set(parseInt(value, 10));
      return;
    }
    const controls = animate(count, parseInt(value, 10), {
      duration: 0.9,
      delay: 0.35,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [count, isNumber, value, reduceMotion]);

  if (!isNumber)
    return <dd className={cn("text-lg font-bold leading-none", className)}>{value}</dd>;
  return <motion.dd className={cn("text-lg font-bold leading-none", className)}>{text}</motion.dd>;
}

type Props = {
  variant: Variant;
  onDone: () => void;
  onClose: () => void;
};

export function FeatureIntro({ variant, onDone, onClose }: Props) {
  const copy = VARIANT_COPY[variant];
  const overlayRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!overlayRef.current) return;
    if (reduceMotion) return;
    const el = overlayRef.current;
    el.animate([{ transform: "translateX(100%)" }, { transform: "translateX(0%)" }], {
      duration: 320,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    });
  }, [reduceMotion]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        exit(onClose);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const exitingRef = useRef(false);
  const exit = useCallback((cb: () => void) => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    const el = overlayRef.current;
    if (!el) return cb();
    el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 180,
      easing: "ease-in",
      fill: "forwards",
    }).addEventListener("finish", cb, { once: true });
  }, []);

  return createPortal(
    <MotionConfig reducedMotion="user">
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[210] overflow-hidden flex flex-col items-center"
        style={{
          background: "linear-gradient(180deg, rgba(10,12,10,0.99) 0%, rgba(14,17,13,0.99) 100%)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feature-hook-title"
      >
        <motion.div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[440px] h-[320px] rounded-full"
          style={{ background: "radial-gradient(circle, #22D3EE40, transparent 70%)" }}
          animate={{ opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(200,255,77,0.4), transparent)",
          }}
        />

        <div className="relative flex h-full w-full max-w-[360px] flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* Protocol pill */}
            <div className="flex justify-center pt-4 pb-3">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-4 py-1.5 backdrop-blur-sm"
              >
                <Sparkles size={12} className="text-[#C8FF4D]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C8FF4D]/85">
                  {copy.pill}
                </span>
              </motion.div>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="show">
              {/* Hero */}
              <motion.section variants={itemVariants} className="mt-6">
                <h1
                  id="feature-hook-title"
                  className="text-[clamp(1.15rem,5.3vw,1.4rem)] font-bold uppercase leading-[1.08] tracking-[-0.035em]"
                >
                  {copy.headline.text}
                  <motion.span
                    className="block"
                    style={{ color: ACCENT }}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {copy.headline.accent}
                  </motion.span>
                </h1>
                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{copy.sub}</p>
              </motion.section>

              {/* Core systems */}
              <motion.section
                variants={itemVariants}
                aria-labelledby="core-heading"
                className="mt-7"
              >
                <h2
                  id="core-heading"
                  className=" text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
                >
                  Core systems
                </h2>
                <SystemCarousel />
              </motion.section>

              {/* What's included */}
              <motion.section
                variants={itemVariants}
                aria-labelledby="facts-heading"
                className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <h2
                  id="facts-heading"
                  className=" text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
                >
                  What is included
                </h2>
                <motion.dl
                  className="mt-3 grid grid-cols-3 gap-2"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
                  }}
                >
                  {FACTS.map(({ value, label, valueClass }) => (
                    <motion.div
                      key={label}
                      variants={cardVariants}
                      className="flex flex-col-reverse justify-end gap-1 rounded-lg border border-white/10 bg-black/60 px-3 py-3"
                    >
                      <dt className=" text-[9px] uppercase leading-3 tracking-wider text-muted-foreground">
                        {label}
                      </dt>
                      <CountValue value={value} className={valueClass} />
                    </motion.div>
                  ))}
                </motion.dl>
                <p className=" mt-3 text-[9px] uppercase tracking-wider text-muted-foreground/60">
                  CAT · GMAT · GRE · Banking · Vedic Math
                </p>
              </motion.section>
            </motion.div>
          </div>

          <footer className="shrink-0 border-t border-white/10 bg-[#0a0a0d]/85 px-5 py-4 backdrop-blur">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                exit(onDone);
              }}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[#a8e62e] py-3 text-[11px] font-bold uppercase tracking-wider text-[#0A0C0A] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Enter Exam Arena{" "}
              <motion.span
                className="inline-flex"
                variants={{ hidden: { x: -4, opacity: 0 }, show: { x: 0, opacity: 1 } }}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <ArrowRight
                  size={14}
                  strokeWidth={2.5}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </motion.span>
            </button>
          </footer>
        </div>
      </div>
    </MotionConfig>,
    document.body,
  );
}
