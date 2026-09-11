"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Brain, CalendarDays, Crosshair, Zap, ArrowRight, Sparkles, Timer } from "lucide-react";
import { DOMAIN_LABELS } from "@/lib/types/template";

const DOMAIN_ACCENT: Record<string, string> = {
  cat: "#34D399",
  gmat: "#22D3EE",
  gre: "#A78BFA",
  "vedic-math": "#FBBF24",
  banking: "#34D399",
};

const SLIDE_DURATION = 3000;

type SlideProps = {
  label: string;
  accent: string;
};

export function PersonaHooks({ domain, onDismiss }: { domain: string; onDismiss: () => void }) {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const label = DOMAIN_LABELS[domain] ?? "Your";
  const accent = DOMAIN_ACCENT[domain] ?? "#C8FF4D";

  useEffect(() => {
    if (!overlayRef.current) return;
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
  }, []);

  useEffect(() => {
    if (slide >= 2) return;
    const t = setTimeout(() => setSlide((s) => s + 1), SLIDE_DURATION);
    return () => clearTimeout(t);
  }, [slide]);

  useEffect(() => {
    if (!frameRef.current) return;
    const els = Array.from(frameRef.current.children);
    gsap.fromTo(
      els,
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.09, ease: "power2.out", delay: 0.05, clearProps: "all" },
    );
    return () => {
      gsap.killTweensOf(els);
    };
  }, [slide]);

  const getStarted = () => {
    onDismiss();
    router.push("/learn?mode=adaptive");
  };

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[70] overflow-hidden flex flex-col items-center px-6 py-10"
      style={{ background: "linear-gradient(180deg, rgba(10,12,10,0.98) 0%, rgba(14,17,13,0.98) 100%)" }}
      role="dialog"
      aria-modal="true"
    >
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[420px] h-[300px] rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${accent}55, transparent 70%)` }} />

      <div className="relative w-full max-w-[340px] flex-1 flex flex-col items-center justify-center">
        <div key={slide} ref={frameRef} className="w-full flex flex-col items-center text-center">
          {slide === 0 && <PromiseSlide label={label} accent={accent} />}
          {slide === 1 && <MechanicSlide label={label} accent={accent} />}
          {slide === 2 && <SetupSlide label={label} accent={accent} onGetStarted={getStarted} />}
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-5 right-5 text-[12px] font-bold text-muted-foreground/40 transition-colors hover:text-foreground/70 active:scale-95"
      >
        Skip
      </button>

      <div className="relative flex items-center gap-2 pb-2">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setSlide(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: slide === i ? 22 : 8,
              height: 8,
              background: slide === i ? accent : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>
    </div>,
    document.body,
  );
}

function PromiseSlide({ label, accent }: SlideProps) {
  const features = [
    { icon: Zap, label: "Adaptive Drills" },
    { icon: Crosshair, label: "Weakness Detection" },
    { icon: CalendarDays, label: "Daily Plans" },
  ];
  return (
    <>
      <div className="size-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: `${accent}18`, border: `1px solid ${accent}35`, boxShadow: `0 0 40px ${accent}25` }}>
        <Brain size={28} style={{ color: accent }} />
      </div>
      <h2 className="text-[24px] font-black tracking-[-0.03em] text-foreground leading-tight">
        {label} <span style={{ color: accent }}>Adaptive</span> Learning
      </h2>
      <p className="mt-3 text-[14px] font-medium text-muted-foreground/70 leading-relaxed max-w-[280px]">
        Turn dead time into an advantage.
      </p>
      <div className="grid grid-cols-3 gap-2 mt-8 w-full">
        {features.map((f) => (
          <div key={f.label} className="flex flex-col items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-2 py-4">
            <f.icon size={18} style={{ color: accent }} />
            <span className="text-[9px] font-bold text-muted-foreground/60 leading-tight">{f.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function MechanicSlide({ accent }: SlideProps) {
  const barsRef = useRef<HTMLDivElement>(null);
  const bars = [
    { name: "Fractions", from: 35, to: 72 },
    { name: "Decimals", from: 60, to: 85 },
    { name: "Algebra", from: 20, to: 55 },
    { name: "Geometry", from: 0, to: 30 },
  ];

  useEffect(() => {
    if (!barsRef.current) return;
    const els = Array.from(barsRef.current.querySelectorAll<HTMLElement>("[data-bar]"));
    const target = els.map((el, i) => ({ el, to: bars[i].to }));
    gsap.fromTo(
      els,
      { width: "0%" },
      { width: (i) => `${bars[i].to}%`, duration: 1.1, ease: "power3.inOut", stagger: 0.12, delay: 0.25 },
    );
    return () => {
      gsap.killTweensOf(target.map((t) => t.el));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h2 className="text-[22px] font-black tracking-[-0.03em] text-foreground leading-tight">
        The engine finds <span style={{ color: accent }}>invisible cracks</span>
      </h2>
      <p className="mt-3 text-[13px] font-medium text-muted-foreground/60 leading-relaxed max-w-[280px]">
        It adjusts difficulty based on your performance in real-time.
      </p>
      <div ref={barsRef} className="w-full flex flex-col gap-3 mt-8">
        {bars.map((b, i) => (
          <div key={b.name} className="flex items-center gap-3">
            <span className="w-20 text-right text-[10px] font-bold text-muted-foreground/55 tracking-wide shrink-0">{b.name}</span>
            <div className="flex-1 h-2.5 rounded-full bg-white/[0.05] overflow-hidden">
              <div data-bar className="h-full rounded-full" style={{ width: 0, background: `linear-gradient(90deg, ${accent}88, ${accent})`, boxShadow: `0 0 10px ${accent}40` }} />
            </div>
            <span className="w-8 text-left text-[10px] font-bold shrink-0" style={{ color: accent }}>{b.to}%</span>
          </div>
        ))}
      </div>
    </>
  );
}

function SetupSlide({ label, accent, onGetStarted }: SlideProps & { onGetStarted: () => void }) {
  const previews = [
    { icon: CalendarDays, title: "Daily Adaptive Plan", desc: "A fresh plan, built around your weak spots" },
    { icon: Timer, title: "Track Your Progress", desc: "Watch mastery grow, topic by topic" },
  ];
  return (
    <>
      <div className="size-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}>
        <CalendarDays size={22} style={{ color: accent }} />
      </div>
      <h2 className="text-[22px] font-black tracking-[-0.03em] text-foreground leading-tight">
        Let&apos;s build your <span style={{ color: accent }}>learning path</span>
      </h2>
      <div className="w-full flex flex-col gap-2.5 mt-7">
        {previews.map((p) => (
          <div key={p.title} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-left">
            <div className="size-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}15` }}>
              <p.icon size={16} style={{ color: accent }} />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-foreground leading-tight">{p.title}</p>
              <p className="text-[10px] text-muted-foreground/50 mt-0.5">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onGetStarted}
        className="mt-8 w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-[13px] font-bold uppercase tracking-widest text-[#0A0C0A] transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: accent, boxShadow: `0 0 24px ${accent}40` }}
      >
        Get Started
        <ArrowRight size={14} strokeWidth={2.5} />
      </button>
      <p className="mt-3 text-[10px] text-muted-foreground/40 font-medium flex items-center gap-1">
        <Sparkles size={9} style={{ color: accent }} /> Tailored for {label} prep
      </p>
    </>
  );
}