"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Sparkles, GraduationCap, Calculator, BookOpen, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";

const EXAM_OPTIONS = [
  { id: "cat", label: "CAT", icon: GraduationCap, color: "#34D399" },
  { id: "gmat", label: "GMAT", icon: Calculator, color: "#22D3EE" },
  { id: "gre", label: "GRE", icon: BookOpen, color: "#A78BFA" },
  { id: "vedic-math", label: "Speed Math", icon: Zap, color: "#FBBF24" },
];

const TEMPORAL_OPTIONS = [
  { label: "Taking exam this year", desc: "We'll plan with a deadline", value: "this_year" },
  { label: "Whenever I'm prepared", desc: "Focus on mastery, no rush", value: "whenever" },
  { label: "Not sure yet", desc: "Flexible, balanced approach", value: "not_sure" },
];

export function AdaptiveReprompt({ onDone }: { onDone: () => void }) {
  const store = useOnboardingStore();
  const [step, setStep] = useState(1);
  const [exam, setExam] = useState<string | null>(store.targetExam || null);
  const [temporal, setTemporal] = useState<string | null>(store.temporalWindow);

  const canNext = step === 1 ? exam !== null : temporal !== null;

  const finish = () => {
    if (!exam) return;
    store.setTargetExam(exam);
    store.addActivePrep(exam);
    store.setActiveLearnDomain(exam);
    store.setTemporalWindow((temporal as "this_year" | "whenever" | "not_sure") ?? "not_sure");
    store.setAdaptiveConfigured(true);
    onDone();
  };

  return (
    <div className="relative rounded-3xl border border-dashed border-white/[0.08] px-5 py-6" style={{ background: "rgba(255,255,255,0.03)" }}>
      {/* Step dots */}
      <div className="flex items-center gap-2 mb-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: step === i ? 22 : 8,
              height: 8,
              background: step >= i ? "#C8FF4D" : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === 1 && (
          <motion.div
            key="exam"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[15px] font-bold tracking-[-0.01em] text-foreground mb-1">Adaptive Learning</p>
            <p className="text-[11px] text-muted-foreground/50 mb-4">Which exam are you preparing for?</p>
            <div className="grid grid-cols-2 gap-2.5">
              {EXAM_OPTIONS.map((opt) => {
                const active = exam === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setExam(opt.id)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-all active:scale-[0.97]",
                      active ? "border-[#C8FF4D]/30 bg-[#C8FF4D]/[0.06]" : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]",
                    )}
                  >
                    <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: active ? "#C8FF4D20" : "rgba(255,255,255,0.04)" }}>
                      <opt.icon size={14} style={{ color: active ? "#C8FF4D" : "rgba(255,255,255,0.35)" }} />
                    </div>
                    <span className={cn("text-[12px] font-bold", active ? "text-foreground" : "text-foreground/60")}>{opt.label}</span>
                    {active && <Check size={12} className="ml-auto text-[#C8FF4D]" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="temporal"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[15px] font-bold tracking-[-0.01em] text-foreground mb-1">{EXAM_OPTIONS.find((e) => e.id === exam)?.label ?? ""} Setup</p>
            <p className="text-[11px] text-muted-foreground/50 mb-4">When is your exam?</p>
            <div className="flex flex-col gap-2">
              {TEMPORAL_OPTIONS.map((opt) => {
                const active = temporal === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTemporal(opt.value)}
                    className={cn(
                      "relative flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all active:scale-[0.97]",
                      active ? "border-[#C8FF4D]/30 bg-[#C8FF4D]/[0.06]" : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-[12px] font-bold leading-tight", active ? "text-foreground" : "text-foreground/60")}>{opt.label}</p>
                      <p className="text-micro text-muted-foreground/60 mt-0.5 font-medium">{opt.desc}</p>
                    </div>
                    {active && (
                      <div className="size-4 rounded-full flex items-center justify-center bg-[#C8FF4D] shrink-0">
                        <Check size={8} className="text-[#0A0C0A]" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center py-4 text-center"
          >
            <div className="size-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(200,255,77,0.1)" }}>
              <Sparkles size={22} className="text-[#C8FF4D]" />
            </div>
            <p className="text-[16px] font-bold tracking-[-0.01em] text-foreground">You&apos;re all set!</p>
            <p className="text-[11px] text-muted-foreground/50 mt-1 max-w-[240px]">
              {EXAM_OPTIONS.find((e) => e.id === exam)?.label ?? ""} adaptive learning is ready to go.
            </p>
            <button
              type="button"
              onClick={finish}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[12px] font-bold uppercase tracking-widest text-[#0A0C0A] transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "#C8FF4D" }}
            >
              Start Learning
              <ArrowRight size={13} strokeWidth={2.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer nav */}
      <div className="flex items-center justify-between mt-5">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1 text-[11px] font-bold text-foreground/40 transition-colors hover:text-foreground/70 active:scale-[0.98]"
          >
            <ArrowLeft size={13} />
            Back
          </button>
        ) : <div />}
        {step < 3 && (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[11px] font-bold tracking-wider text-[#0A0C0A] transition-all active:scale-95",
              canNext ? "" : "bg-white/[0.06] text-muted-foreground/20 cursor-not-allowed",
            )}
            style={canNext ? { background: "#C8FF4D" } : undefined}
          >
            Next
            <ArrowRight size={12} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}