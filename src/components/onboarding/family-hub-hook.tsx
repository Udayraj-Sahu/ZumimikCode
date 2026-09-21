"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  Activity,
  ArrowRight,
  Ban,
  Brain,
  Camera,
  CheckCircle2,
  ChevronDown,
  Flower2,
  Gamepad2,
  GraduationCap,
  Printer,
  ShieldCheck,
  Swords,
  Target,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Tone = "cyan" | "fuchsia" | "lime";

const TONES: Record<Tone, { wrap: string; num: string; text: string; tag: string; tile: string; accent: string; chip: string }> = {
  cyan: {
    wrap: "border-cyan-400/25 bg-cyan-400/[0.03]",
    num: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
    text: "text-cyan-300",
    tag: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    tile: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
    accent: "border-l-cyan-400/60",
    chip: "border-cyan-400/30 bg-cyan-400/[0.05]",
  },
  fuchsia: {
    wrap: "border-fuchsia-400/25 bg-fuchsia-400/[0.03]",
    num: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
    text: "text-fuchsia-300",
    tag: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300",
    tile: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
    accent: "border-l-fuchsia-400/60",
    chip: "border-fuchsia-400/30 bg-fuchsia-400/[0.05]",
  },
  lime: {
    wrap: "border-[#C8FF4D]/25 bg-[#C8FF4D]/[0.03]",
    num: "border-[#C8FF4D]/40 bg-[#C8FF4D]/10 text-[#C8FF4D]",
    text: "text-[#C8FF4D]",
    tag: "border-[#C8FF4D]/30 bg-[#C8FF4D]/10 text-[#C8FF4D]",
    tile: "border-[#C8FF4D]/40 bg-[#C8FF4D]/10 text-[#C8FF4D]",
    accent: "border-l-[#C8FF4D]/60",
    chip: "border-[#C8FF4D]/30 bg-[#C8FF4D]/[0.05]",
  },
};

const STAGES: { age: string; label: string; tone: Tone }[] = [
  { age: "AGES 6-12", label: "Tactile Base", tone: "cyan" },
  { age: "AGES 10-15", label: "Co-op Dojo", tone: "fuchsia" },
  { age: "AGES 16+", label: "99+ %ile Engine", tone: "lime" },
];

const SECTIONS: {
  id: string;
  num: string;
  eyebrow: string;
  tag: string;
  title: string;
  desc: string;
  tone: Tone;
  items: { title: string; badge?: string; desc: string; Icon: LucideIcon }[];
}[] = [
  {
    id: "kids",
    num: "01",
    eyebrow: "AGES 6-12 ECOSYSTEM",
    tag: "ZERO-SCREEN FOCUS",
    title: "Kids Olympiad & Tactile Foundation",
    desc: "Physical worksheets engineered for deep neuroplasticity, reinforced by lightning micro-sessions.",
    tone: "cyan",
    items: [
      {
        title: "Zero-Screen Printable Vedic Grids",
        badge: "PDF PACKS",
        desc: "High-contrast, downloadable offline drills with tactile Nikhilam balance dots. Zero blue light, total kinesthetic calculation confidence.",
        Icon: Printer,
      },
      {
        title: "5-Min Micro-Games: Dot Battles",
        badge: "DAILY DRILL",
        desc: "Gamified subitizing & fast pattern triggers. Dual training tracks: Nikhilam quant speed & word-logic matrices to lock in working memory.",
        Icon: Gamepad2,
      },
      {
        title: "Vision Grading & BKT Loop",
        badge: "AUTO-CALIBRATE",
        desc: "Snap a phone photo of the child's physical worksheet. Instant local neural OCR grades handwritten work and recalculates Bayesian Knowledge Tracing scores.",
        Icon: Camera,
      },
    ],
  },
  {
    id: "coop",
    num: "02",
    eyebrow: "COOPERATIVE DOJO MODE",
    tag: "ZERO HOMEWORK DRAG",
    title: "Family Collaborative Sessions",
    desc: "Shift from stressful homework policing to synchronized mental sparring and shared breakthroughs.",
    tone: "fuchsia",
    items: [
      {
        title: "10-Min Weekend Sparring",
        desc: "Parent & student solve staggered multi-digit patterns simultaneously. Parent solves with executive complexity; child uses rapid visual sutras.",
        Icon: Swords,
      },
      {
        title: "Empathetic Telemetry",
        desc: "Zero medicalized or anxiety-inducing metrics. Only measures reaction latency decay, working memory agility, and sustained visual momentum.",
        Icon: Activity,
      },
    ],
  },
];

const METRICS: { label: string; value: string; desc: string; Icon: LucideIcon; card: string; text: string }[] = [
  {
    label: "SPEED METRIC",
    value: "<1.18s",
    desc: "Sub-second Vedic calculation reflex",
    Icon: Zap,
    card: "border-[#C8FF4D]/30",
    text: "text-[#C8FF4D]",
  },
  {
    label: "ACCURACY FLOOR",
    value: "99.4%",
    desc: "Deterministic digit-sum verification",
    Icon: Target,
    card: "border-cyan-400/30",
    text: "text-cyan-300",
  },
  {
    label: "FLUID LOGIC",
    value: "Raven's Gf",
    desc: "Abstract pattern & spatial synthesis",
    Icon: Brain,
    card: "border-fuchsia-400/30",
    text: "text-fuchsia-300",
  },
  {
    label: "STRESS SHIELDER",
    value: "PVT Zero",
    desc: "Psychomotor vigilance & anti-panic",
    Icon: Flower2,
    card: "border-emerald-400/30",
    text: "text-emerald-300",
  },
];

const STEPS: { title: string; desc: string; done?: boolean }[] = [
  {
    title: "Physical Practice or Micro-Drill",
    desc: "Paper worksheet packet or quick 5-min tactile drill, done fully offline.",
  },
  {
    title: "1-Tap Scan / Instant Telemetry",
    desc: "Neural model maps sub-second bottlenecks in solving speed and accuracy from a single photo.",
  },
  {
    title: "Dynamic Recalibration & Lifelong Shield",
    desc: "Next day curriculum custom-synthesized from your latest telemetry, building a lifelong cognitive shield.",
    done: true,
  },
];

const TRUST: { label: string; Icon: LucideIcon; text: string }[] = [
  { label: "DPDP 2023 & COPPA Compliant", Icon: ShieldCheck, text: "text-[#C8FF4D]" },
  { label: "100% Zero-Ad Learning Feed", Icon: Ban, text: "text-cyan-300" },
  { label: "Harvard & Cambridge Olympiad Aligned", Icon: GraduationCap, text: "text-fuchsia-300" },
];

const ASSURANCES = ["INSTANT DOJO ACTIVATION", "30-DAY VELOCITY GUARANTEE", "CANCEL ANYTIME"];

function SectionShell({
  num,
  eyebrow,
  tag,
  title,
  desc,
  tone,
  children,
}: {
  num: string;
  eyebrow: string;
  tag: string;
  title: string;
  desc: string;
  tone: Tone;
  children: ReactNode;
}) {
  const t = TONES[tone];
  return (
    <section className={`rounded-2xl border p-3.5 ${t.wrap}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`font-mono grid h-6 w-6 place-items-center rounded border text-[10px] font-bold ${t.num}`}>
            {num}
          </span>
          <span className={`font-mono text-[9px] font-bold leading-tight tracking-widest ${t.text}`}>
            {eyebrow}
          </span>
        </div>
        <span className={`font-mono shrink-0 rounded border px-1.5 py-0.5 text-[7px] font-bold tracking-wider ${t.tag}`}>
          {tag}
        </span>
      </div>

      <h2 className="mt-3 text-[17px] font-black uppercase leading-tight tracking-tight text-foreground">{title}</h2>
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground/70">{desc}</p>
      {children}
    </section>
  );
}

function EngineSteps() {
  const [openStep, setOpenStep] = useState<number | null>(null);

  return (
    <ul className="mt-3 space-y-2">
      {STEPS.map((s, i) => {
        const open = openStep === i;
        return (
          <li key={s.title}>
            <button
              onClick={() => setOpenStep(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3 text-left transition hover:border-cyan-400/30"
            >
              <span className="font-mono grid h-6 w-6 shrink-0 place-items-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-[10px] font-bold text-cyan-300">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase leading-snug tracking-wide text-foreground">{s.title}</span>
                <span className={`mt-0.5 block text-[10px] leading-relaxed text-muted-foreground/60 ${open ? "" : "line-clamp-1"}`}>
                  {s.desc}
                </span>
              </span>
              {s.done ? (
                <CheckCircle2 size={14} className="shrink-0 text-[#C8FF4D]" />
              ) : (
                <ChevronDown size={14} className={`shrink-0 text-muted-foreground/50 transition-transform ${open ? "rotate-180" : ""}`} />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function FamilyHubHook({ onDone, onClose }: { onDone: () => void; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const exitingRef = useRef(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    if (overlayRef.current) {
      overlayRef.current.animate([{ transform: "translateX(100%)" }, { transform: "translateX(0%)" }], {
        duration: 320,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
      className="fixed inset-0 z-[220] overflow-y-auto"
      style={{ background: "linear-gradient(180deg, rgba(10,12,10,0.99) 0%, rgba(14,17,13,0.99) 100%)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="family-hub-hook-title"
    >
      <div className="pointer-events-none absolute -top-20 left-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-[90px]" />
      <div className="pointer-events-none absolute right-0 top-[45%] h-64 w-64 rounded-full bg-fuchsia-600/[0.08] blur-[100px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,255,77,0.35), transparent)" }} />

      <div className="relative min-h-full w-full max-w-[400px] mx-auto">
        {/* top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0a0a0d]/85 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <button aria-label="Close" onClick={() => exit(onClose)} className="text-cyan-300 hover:text-cyan-200 transition-colors">
              <X size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold tracking-[0.25em] text-[#C8FF4D]">
                  EXAM ARENA
                </span>
                <span className="rounded border border-cyan-400/40 bg-cyan-400/10 px-1.5 py-px font-mono text-[7px] font-bold tracking-wider text-cyan-300">
                  ECOSYSTEM PREVIEW
                </span>
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-wide text-muted-foreground/70">FAMILY HUB</div>
            </div>
          </div>
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-[#C8FF4D]/40 bg-[#C8FF4D]/10 text-[#C8FF4D]">
            <Zap size={14} />
          </span>
        </header>

        {/* hero */}
        <section className="relative px-4 pt-5">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5">
            <span className="font-mono text-[8px] font-bold tracking-wider text-cyan-300">
              PRE-PRICING COGNITIVE ROADMAP // MULTI-GEN PROTOCOL
            </span>
            <span className="shrink-0 rounded border border-[#C8FF4D]/40 bg-[#C8FF4D]/10 px-1.5 py-px font-mono text-[8px] font-bold text-[#C8FF4D]">
              HUD v4.2
            </span>
          </div>

          <h1 id="family-hub-hook-title" className="mt-4 text-[26px] font-black uppercase leading-[1.1] tracking-tight text-foreground">
            From zero-screen foundation to{' '}
            <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              99+ %ile mastery.
            </span>
          </h1>
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground/75">
            How the Exam Arena ecosystem adapts seamlessly from 6-minute daily tactile kids games to high-stakes 16+
            executive exam protocols.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {STAGES.map(({ age, label, tone }) => (
              <div key={age} className={`rounded-lg border px-2 py-2 text-center ${TONES[tone].chip}`}>
                <div className={`font-mono text-[8px] font-bold tracking-wider ${TONES[tone].text}`}>{age}</div>
                <div className="mt-0.5 text-[10px] font-bold text-foreground/80">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* sections */}
        <div className="relative mt-6 space-y-5 px-4 pb-6">
          {SECTIONS.map((s) => {
            const t = TONES[s.tone];
            return (
              <SectionShell key={s.id} {...s}>
                <ul className="mt-3 space-y-2.5">
                  {s.items.map(({ title, badge, desc, Icon }) => (
                    <li
                      key={title}
                      className={`flex gap-3 rounded-xl border border-l-2 border-white/10 bg-black/40 p-3 ${t.accent}`}
                    >
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${t.tile}`}>
                        <Icon size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-[11px] font-bold uppercase leading-snug tracking-wide text-foreground">{title}</h3>
                          {badge && (
                            <span className={`shrink-0 rounded border px-1.5 py-px font-mono text-[7px] font-bold tracking-wider ${t.tag}`}>
                              {badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground/70">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </SectionShell>
            );
          })}

          {/* 03 — 16+ cognitive arena */}
          <SectionShell
            num="03"
            eyebrow="AGES 16+ & EXECUTIVE EXAM TRACK"
            tag="CAT · GMAT · GRE"
            title="The 16+ Cognitive Arena"
            desc="The exact foundation scales into high-speed mental algorithmic mastery for top-percentile test prep."
            tone="lime"
          >
            <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono max-w-[170px] text-[8px] font-bold leading-snug tracking-wider text-muted-foreground/80">
                  4-PILLAR COGNITIVE STATE ARCHITECTURE
                </span>
                <span className="font-mono shrink-0 text-[8px] font-bold tracking-wider text-[#C8FF4D]">
                  CALIBRATED HUD
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {METRICS.map(({ label, value, desc, Icon, card, text }) => (
                  <div key={label} className={`rounded-lg border bg-white/[0.02] p-2.5 ${card}`}>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[7px] font-bold tracking-wider text-muted-foreground/60">
                        {label}
                      </span>
                      <Icon size={11} className={text} />
                    </div>
                    <div className={`mt-2 text-[17px] font-black leading-tight ${text}`}>{value}</div>
                    <div className="mt-1 text-[9px] leading-snug text-muted-foreground/60">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </SectionShell>

          {/* 04 — unified engine */}
          <SectionShell
            num="04"
            eyebrow="UNIFIED CYBER ENGINE"
            tag="REAL-TIME SYNC"
            title="How the adaptive engine connects it all"
            desc="Continuous data loop turns everyday offline practice into long-range cognitive leverage."
            tone="cyan"
          >
            <EngineSteps />
          </SectionShell>

          {/* trust list */}
          <ul className="space-y-2 px-1 pt-1">
            {TRUST.map(({ label, Icon, text }) => (
              <li key={label} className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
                <Icon size={13} className={text} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* sticky household pass bar */}
        <footer className="sticky bottom-0 z-10 border-t border-[#C8FF4D]/20 bg-[#0a0a0d]/95 px-4 pb-6 pt-2.5 backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C8FF4D] shadow-[0_0_8px_rgba(200,255,77,0.9)]" />
              <span className="font-mono text-[9px] font-bold tracking-wider text-[#C8FF4D]">
                HOUSEHOLD PASS ACTIVE
              </span>
            </span>
            <span className="font-mono max-w-[130px] rounded border border-[#C8FF4D]/40 bg-[#C8FF4D]/15 px-2 py-1 text-center text-[7px] font-bold leading-tight tracking-wider text-[#C8FF4D]">
              30% MULTI-SEAT STACK ON NEXT SCREEN
            </span>
          </div>

          <button
            onClick={() => exit(onDone)}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-mono text-[12px] font-bold tracking-wider text-[#0A0C0A] transition hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "linear-gradient(90deg, #C8FF4D, #B9F45C)",
              boxShadow: "0 0 28px rgba(163,230,53,0.35), 0 1px 0 rgba(255,255,255,0.25) inset",
            }}
          >
            CONFIGURE FAMILY SEATS
            <ArrowRight size={14} />
          </button>

          <div className="mt-2 flex items-center justify-between">
            <ul className="font-mono flex items-center gap-2 text-[7px] tracking-wider text-muted-foreground/60">
              {ASSURANCES.map((a, i) => (
                <li key={a} className="flex items-center gap-2">
                  {i > 0 && <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />}
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => exit(onClose)}
            className="mx-auto mt-2 block text-[10px] text-muted-foreground/60 underline-offset-2 hover:text-muted-foreground hover:underline transition-colors"
          >
            Skip for now
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}