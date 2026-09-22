"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import {
  ChevronLeft,
  Check,
  X,
  User,
  Users,
  Target,
  Brain,
  ClipboardList,
  GraduationCap,
  Briefcase,
  Search,
  Heart,
  BookOpen,
  Plus,
  Calculator,
  Zap,
  School,
  Compass,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboardingStore, examIdForGoal, goalForExam } from "@/stores/onboarding-store";
import { VEDIC_USE_CASES, DRILLS, PLANS } from "@/lib/types/onboarding";
import { FeatureIntro } from "@/components/onboarding/feature-intro";
import { FamilyIntro } from "@/components/onboarding/family-intro";
import { FamilyHubIntro } from "@/components/onboarding/family-hub-intro";
import { SeatBuilderIntro } from "@/components/onboarding/seat-builder-intro";
import { StoryIntro } from "@/components/onboarding/story-intro";
import { ArenaIntro } from "@/components/onboarding/arena-intro";
import { PitchIntro } from "@/components/onboarding/pitch-intro";
import { PlanIntro } from "@/components/onboarding/plan-intro";

const PERSONA_OPTIONS = [
  { label: "Student", icon: GraduationCap, color: "#34D399", desc: "Currently studying" },
  { label: "Working Professional", icon: Briefcase, color: "#22D3EE", desc: "Balancing work & prep" },
  { label: "Job Seeker", icon: Search, color: "#A78BFA", desc: "Preparing for next role" },
  { label: "Parent", icon: Heart, color: "#FB7185", desc: "Guiding a child" },
  { label: "Educator", icon: BookOpen, color: "#FBBF24", desc: "Teaching & mentoring" },
  { label: "Other", icon: Plus, color: "#8B9086", desc: "Something else" },
];

const GOAL_OPTIONS = [
  { label: "Prepare for CAT", icon: Target, color: "#34D399", desc: "MBA entrance exam" },
  { label: "Prepare for GMAT", icon: Calculator, color: "#22D3EE", desc: "Graduate management" },
  { label: "Prepare for GRE", icon: BookOpen, color: "#A78BFA", desc: "Graduate record exam" },
  { label: "Master speed math", icon: Zap, color: "#FBBF24", desc: "Calculation skills" },
  { label: "Help with school stuff", icon: School, color: "#FB7185", desc: "Academic support" },
  { label: "Just exploring", icon: Compass, color: "#8B9086", desc: "Seeing what's here" },
];

type TemporalWindowId = "this_year" | "whenever" | "not_sure";

const TEMPORAL_GOALS = ["Prepare for CAT", "Prepare for GMAT", "Prepare for GRE"];

const TEMPORAL_PANEL_OPTIONS: { id: TemporalWindowId; label: string }[] = [
  { id: "this_year", label: "Taking an exam this year" },
  { id: "whenever", label: "Whenever I am prepared" },
  { id: "not_sure", label: "Not sure yet" },
];

const TRIGGER_GROUPED = [
  {
    label: "Life Stage",
    color: "#C8FF4D",
    tags: ["Final Year Student", "Gap Year", "Career Switch", "Returning to Work"],
  },
  {
    label: "Mindset",
    color: "#A855F7",
    tags: ["Math Anxiety", "Confidence Boost", "Consistency", "Competition Drive"],
  },
  {
    label: "Parenting",
    color: "#22C55E",
    tags: ["Helping My Child", "Homeschool Support", "School Project"],
  },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 30 }, (_, i) => 2010 - i);

type StepId = "name" | "persona" | "goal" | "triggers" | "details";

const STEP_LABEL_BY_ID: Record<StepId, string> = {
  name: "Name",
  persona: "Who",
  goal: "Goal",
  triggers: "Vibe",
  details: "Details",
};

const STEP_ICON_BY_ID: Record<StepId, any> = {
  name: User,
  persona: Users,
  goal: Target,
  triggers: Brain,
  details: ClipboardList,
};

type Props = { onClose: () => void; inline?: boolean };

export function OnboardingModal({ onClose, inline }: Props) {
  const store = useOnboardingStore();
  const [step, setStep] = useState(store.firstName ? store.currentStep : 0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [completed, setCompleted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const completeRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(0);

  const [localFirstName, setLocalFirstName] = useState(store.firstName);
  const [localPersona, setLocalPersona] = useState<string | null>(store.persona);
  const [localGoal, setLocalGoal] = useState<string | null>(store.goal ?? goalForExam(store.targetExam));
  const [localTemporal, setLocalTemporal] = useState<TemporalWindowId | null>(store.temporalWindow);
  const [localTriggers, setLocalTriggers] = useState<string[]>(store.triggers);
  const [localSex, setLocalSex] = useState<string | null>(store.sex);
  const [localDob, setLocalDob] = useState(store.dob);
  const [localVedicUseCase, setLocalVedicUseCase] = useState<string | null>(store.vedicUseCase);
  const [featureHookVariant, setFeatureHookVariant] = useState<TemporalWindowId | "vedic" | null>(null);
  const [showFamily, setShowFamily] = useState(false);
  const [showFamilyHub, setShowFamilyHub] = useState(false);
  const [showSeatBuilder, setShowSeatBuilder] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [showArena, setShowArena] = useState(false);
  const [showPitch, setShowPitch] = useState(false);
  const [showPlan, setShowPlan] = useState(false);

  const handleTemporal = (v: TemporalWindowId | null) => {
    setLocalTemporal(v);
    if (v) setFeatureHookVariant(v);
  };

  const handleVedicUseCase = (v: string | null) => {
    setLocalVedicUseCase(v);
    if (v === "Lightning Mental Calc" || v === "Brain Gym") {
      setFeatureHookVariant("vedic");
    } else if (v === "Teaching My Kid" || v === "Competitive Exam") {
      setShowFamily(true);
    }
  };

  const isExam = localGoal ? TEMPORAL_GOALS.includes(localGoal) : false;
  const isVedic = localGoal === "Master speed math";

  const resolvedSteps: StepId[] = useMemo(
    () => ["name", "persona", "goal", "triggers", "details"],
    [],
  );

  const totalSteps = resolvedSteps.length;
  const stepLabels = resolvedSteps.map((id) => STEP_LABEL_BY_ID[id]);
  const stepIcons = resolvedSteps.map((id) => STEP_ICON_BY_ID[id]);

  useEffect(() => {
    if (store.isOnboarded) {
      setCompleted(true);
    }
  }, [store.isOnboarded]);

  useEffect(() => {
    if (inline) return;
    if (overlayRef.current && panelRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(panelRef.current, { opacity: 0, y: 32, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" });
    }
  }, [inline]);

  const animateStepTransition = useCallback((dir: 1 | -1) => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    gsap.fromTo(el,
      { opacity: 0, x: dir * 40 },
      { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" },
    );
  }, []);

  const resolvedExamId = () =>
    examIdForGoal(localGoal) || (localGoal === "Master speed math" ? store.targetExam : "");

  const persistPartial = () => {
    store.setFirstName(localFirstName);
    store.setPersona(localPersona);
    store.setGoal(localGoal);
    store.setTargetExam(resolvedExamId());
    if (isExam) store.setTemporalWindow(localTemporal);
    if (isVedic) store.setVedicUseCase(localVedicUseCase as any);
    store.setSex(localSex);
    store.setDob(localDob);
    localTriggers.forEach((t) => {
      if (!store.triggers.includes(t)) store.toggleTrigger(t);
    });
    store.triggers.forEach((t) => {
      if (!localTriggers.includes(t)) store.toggleTrigger(t);
    });
    store.setCurrentStep(step);
  };

  const handleClose = () => {
    persistPartial();
    if (inline) { onClose(); return; }
    if (overlayRef.current && panelRef.current) {
      gsap.to(panelRef.current, { opacity: 0, y: 20, scale: 0.97, duration: 0.2, ease: "power2.in" });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
    } else {
      onClose();
    }
  };

  const handleFinish = () => {
    store.setFirstName(localFirstName);
    store.setPersona(localPersona);
    store.setGoal(localGoal);
    localTriggers.forEach((t) => {
      if (!store.triggers.includes(t)) store.toggleTrigger(t);
    });
    store.triggers.forEach((t) => {
      if (!localTriggers.includes(t)) store.toggleTrigger(t);
    });
    store.setSex(localSex);
    store.setDob(localDob);
    store.setTargetExam(resolvedExamId());
    if (isExam) store.setTemporalWindow(localTemporal);
    if (isVedic) store.setVedicUseCase(localVedicUseCase as any);
    const domainId = resolvedExamId();
    store.setAdaptiveConfigured(domainId !== "");
    store.setJustExploring(localGoal === "Just exploring");
    store.finishOnboarding();
    setCompleted(true);
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" });
    }
    setTimeout(() => animateExitUp(), 2300);
  };

  const animateExitUp = () => {
    const overlay = overlayRef.current;
    if (!overlay) { onClose(); return; }
    if (panelRef.current) {
      gsap.to(panelRef.current, { y: -40, duration: 0.6, ease: "power2.in" });
    }
    if (completeRef.current) {
      gsap.to(completeRef.current, { y: -110, opacity: 0, duration: 0.6, ease: "power2.in" });
    }
    gsap.to(overlay, { opacity: 0, duration: 0.5, onComplete: onClose });
  };

  const goNext = () => {
    if (step < totalSteps - 1) {
      setDirection(1);
      prevStepRef.current = step;
      setStep((s) => s + 1);
    }
  };

  const goPrev = () => {
    if (step > 0) {
      setDirection(-1);
      prevStepRef.current = step;
      setStep((s) => s - 1);
    }
  };

  useEffect(() => {
    if (prevStepRef.current !== step) {
      animateStepTransition(direction);
    }
  }, [step, direction, animateStepTransition]);

  useEffect(() => {
    if (prevStepRef.current !== step) {
      store.setCurrentStep(step);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const canNext = (() => {
    const id = resolvedSteps[step];
    if (id === "name") return localFirstName.trim().length > 0;
    if (id === "persona") return localPersona !== null;
    if (id === "goal") {
      if (!localGoal) return false;
      if (isExam) return localTemporal !== null;
      if (isVedic) return localVedicUseCase !== null;
      return true;
    }
    return true;
  })();

  const panel = (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Header with 5 step icons */}
      <div className="sticky top-0 z-10 px-5 pt-4 pb-4 bg-[rgba(14,17,13,0.98)]">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={handleClose}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground/50 hover:text-foreground/80 transition-colors active:scale-95"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2">
            {stepLabels.map((label, i) => {
              const StepIcon = stepIcons[i];
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div
                  key={label}
                  className={cn(
                    "flex items-center justify-center rounded-full transition-all duration-300",
                    isActive
                      ? "size-8 bg-[#C8FF4D]/15 ring-2 ring-[#C8FF4D]/40"
                      : isDone
                        ? "size-6 bg-[#C8FF4D]/10"
                        : "size-6 bg-white/[0.05]",
                  )}
                >
                  {isDone ? (
                    <Check size={10} className="text-[#C8FF4D]" />
                  ) : (
                    <StepIcon
                      size={isActive ? 14 : 10}
                      className={cn(
                        "transition-colors duration-300",
                        isActive ? "text-[#C8FF4D]" : "text-muted-foreground/40",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / totalSteps) * 100}%`, background: "#C8FF4D" }}
          />
        </div>
      </div>

      {/* Content */}
      <div data-onboard-scroll className={cn("flex-1 min-h-0 px-5", completed ? "overflow-hidden" : "overflow-y-auto pt-4 pb-6 scroll-smooth")} style={{ scrollbarWidth: "none" }}>
        {completed ? (
          <div ref={completeRef} className="h-full flex flex-col">
            <CompletionScreen />
          </div>
        ) : (
          <div ref={contentRef} className="flex flex-col">
            {(() => {
              const id = resolvedSteps[step];
              switch (id) {
                case "name":
                  return (
                    <StepName
                      value={localFirstName}
                      onChange={setLocalFirstName}
                      onNext={goNext}
                    />
                  );
                case "persona":
                  return (
                    <StepSingleSelect
                      title="What describes you?"
                      subtitle="Pick the one that fits best"
                      options={PERSONA_OPTIONS}
                      value={localPersona}
                      onSelect={setLocalPersona}
                    />
                  );
                case "goal":
                  return (
                    <StepGoal
                      value={localGoal}
                      temporal={localTemporal}
                      vedicUseCase={localVedicUseCase}
                      onSelect={setLocalGoal}
                      onTemporal={handleTemporal}
                      onVedicUseCase={handleVedicUseCase}
                    />
                  );
                case "triggers":
                  return (
                    <StepTriggers
                      value={localTriggers}
                      onChange={setLocalTriggers}
                    />
                  );
                case "details":
                  return (
                    <StepDetails
                      sex={localSex}
                      onSexChange={setLocalSex}
                      dob={localDob}
                      onDobChange={setLocalDob}
                    />
                  );
                default:
                  return null;
              }
            })()}
          </div>
        )}
      </div>

      {/* Footer */}
      {!completed && (
        <div className="sticky bottom-0 px-5 pb-6 pt-3">
          <div className="flex items-center justify-between">
            {step > 0 ? (
              <button
                type="button"
                onClick={goPrev}
                className="flex items-center gap-1 text-[11px] font-bold text-foreground/40 outline-none transition-colors hover:text-foreground/70 active:scale-[0.98]"
              >
                <ChevronLeft size={14} />
                Back
              </button>
            ) : <div />}
            <button
              type="button"
              onClick={step === totalSteps - 1 ? handleFinish : goNext}
              disabled={!canNext}
              className={cn(
                "size-10 rounded-full flex items-center justify-center transition-all active:scale-90",
                canNext
                  ? "text-[#0A0C0A]"
                  : "bg-white/[0.06] text-muted-foreground/20 cursor-not-allowed",
              )}
              style={canNext ? { background: "#C8FF4D" } : undefined}
            >
              {step === totalSteps - 1 ? (
                <Sparkles size={16} />
              ) : (
                <ArrowRight size={16} />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const featureHookDone = () => {
    const variant = featureHookVariant;
    setFeatureHookVariant(null);
    if (variant === "vedic") {
      setShowFamilyHub(true);
      return;
    }
    if (variant === "this_year") {
      setShowArena(true);
      return;
    }
    if (variant === "whenever" || variant === "not_sure") {
      setShowPitch(true);
      return;
    }
    goNext();
  };

  const familyHubIntro = showFamilyHub ? (
    <FamilyHubIntro
      onDone={() => {
        setShowFamilyHub(false);
        setShowSeatBuilder(true);
      }}
      onClose={() => {
        setShowFamilyHub(false);
        setShowSeatBuilder(true);
      }}
    />
  ) : null;

  const seatBuilderIntro = showSeatBuilder ? (
    <SeatBuilderIntro
      onClose={() => {
        setShowSeatBuilder(false);
        store.setPlanHookSeen(true);
        setShowStory(true);
      }}
    />
  ) : null;

  const storyIntro = showStory ? (
    <StoryIntro
      onClose={() => {
        setShowStory(false);
        store.setStoryHookSeen(true);
        goNext();
      }}
    />
  ) : null;

  const familyIntro = showFamily ? (
    <FamilyIntro
      onDone={() => {
        setShowFamily(false);
        setShowFamilyHub(true);
      }}
      onClose={() => {
        setShowFamily(false);
        setShowFamilyHub(true);
      }}
    />
  ) : null;

  const arenaIntro = showArena ? (
    <ArenaIntro
      onClose={() => {
        setShowArena(false);
        store.setArenaHookSeen(true);
        setShowPlan(true);
      }}
    />
  ) : null;

  const pitchIntro = showPitch ? (
    <PitchIntro
      onClose={() => {
        setShowPitch(false);
        store.setPitchHookSeen(true);
        setShowPlan(true);
      }}
    />
  ) : null;

  const planIntro = showPlan ? (
    <PlanIntro
      onClose={() => {
        setShowPlan(false);
        store.setPlanHookSeen(true);
        setShowStory(true);
      }}
    />
  ) : null;

  const introOverlay = featureHookVariant ? (
    <FeatureIntro variant={featureHookVariant} onDone={featureHookDone} onClose={() => setFeatureHookVariant(null)} />
  ) : null;

  if (inline) return <>{panel}{introOverlay}{familyIntro}{familyHubIntro}{seatBuilderIntro}{storyIntro}{arenaIntro}{pitchIntro}{planIntro}</>;

  return (
    <>
      {createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div
        ref={panelRef}
        className="w-full max-w-md max-h-[90vh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-white/[0.06] shadow-2xl flex flex-col"
        style={{ background: "rgba(14,17,13,0.98)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {panel}
      </div>
    </div>,
    document.body,
  )}
      {introOverlay}
      {familyIntro}
      {familyHubIntro}
      {seatBuilderIntro}
      {storyIntro}
      {arenaIntro}
      {pitchIntro}
      {planIntro}
    </>
  );
}

/* ── Step sub-components ── */

function StepName({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <div className="size-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(200,255,77,0.1)" }}>
          <User size={20} className="text-[#C8FF5A]" />
        </div>
        <h2 className="text-[20px] font-black tracking-[-0.03em] text-foreground">What&apos;s your first name?</h2>
        <p className="text-[13px] text-muted-foreground/50 mt-1.5 font-medium">So we can personalise your experience</p>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && value.trim().length > 0) onNext(); }}
        placeholder="Type your name..."
        className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-4 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/25 outline-none focus:border-[#C8FF5A]/30 focus:ring-1 focus:ring-[#C8FF5A]/20 transition-all"
        autoFocus
      />
      {value.trim().length > 0 && (
        <p className="mt-3 text-[12px] text-muted-foreground/60 font-medium">
          Hey <span className="text-foreground/70 font-bold">{value.trim()}</span>, nice to meet you!
        </p>
      )}
    </div>
  );
}

function StepSingleSelect({
  title,
  subtitle,
  options,
  value,
  onSelect,
}: {
  title: string;
  subtitle: string;
  options: { label: string; icon: any; color: string; desc?: string }[];
  value: string | null;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="mb-5">
        <h2 className="text-[20px] font-black tracking-[-0.03em] text-foreground">{title}</h2>
        <p className="text-[13px] text-muted-foreground/50 mt-1.5 font-medium">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          const active = value === opt.label;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onSelect(opt.label)}
              className={cn(
                "relative flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-all active:scale-[0.97]",
                active
                  ? "border-[#C8FF4D]/30 bg-[#C8FF4D]/[0.06]"
                  : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]",
              )}
            >
              <div
                className="size-10 shrink-0 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: active ? "#C8FF4D20" : "rgba(255,255,255,0.04)" }}
              >
                <Icon size={16} style={{ color: active ? "#C8FF4D" : "rgba(255,255,255,0.3)" }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("text-[12px] font-bold leading-tight truncate", active ? "text-foreground" : "text-foreground/60")}>
                  {opt.label}
                </p>
                {opt.desc && (
                  <p className="text-micro text-muted-foreground/60 mt-0.5 font-medium truncate">{opt.desc}</p>
                )}
              </div>
              {active && (
                <div className="absolute top-2 right-2 size-4 rounded-full flex items-center justify-center bg-[#C8FF4D]">
                  <Check size={8} className="text-[#0A0C0A]" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepGoal({
  value,
  temporal,
  vedicUseCase,
  onSelect,
  onTemporal,
  onVedicUseCase,
}: {
  value: string | null;
  temporal: TemporalWindowId | null;
  vedicUseCase: string | null;
  onSelect: (v: string | null) => void;
  onTemporal: (v: TemporalWindowId | null) => void;
  onVedicUseCase: (v: string | null) => void;
}) {
  const handleGoalClick = (label: string) => {
    if (value === label) {
      onSelect(null);
      onTemporal(null);
      onVedicUseCase(null);
    } else {
      onSelect(label);
    }
  };

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) return;
    const t = setTimeout(() => {
      const container = listRef.current?.closest<HTMLElement>("[data-onboard-scroll]");
      const activeWrap = listRef.current?.querySelector<HTMLElement>(`[data-goal="${value}"]`);
      if (!container || !activeWrap) return;
      const panel = activeWrap.querySelector<HTMLElement>("[data-panel]");
      const target = panel ?? activeWrap;
      const r = target.getBoundingClientRect();
      const c = container.getBoundingClientRect();
      if (r.bottom > c.bottom) {
        container.scrollTo({ top: container.scrollTop + (r.bottom - c.bottom) + 16, behavior: "smooth" });
      } else if (r.top < c.top) {
        container.scrollTo({ top: container.scrollTop + (r.top - c.top) - 16, behavior: "smooth" });
      }
    }, 80);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="flex flex-col">
      <div className="mb-5">
        <h2 className="text-[20px] font-black tracking-[-0.03em] text-foreground">What brings you here?</h2>
        <p className="text-[13px] text-muted-foreground/50 mt-1.5 font-medium">We&apos;ll tailor content to your goal</p>
      </div>
      <div ref={listRef} className="flex flex-col gap-3">
        {GOAL_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = value === opt.label;
          const isExam = TEMPORAL_GOALS.includes(opt.label);
          const isVedic = opt.label === "Master speed math";
          return (
            <div key={opt.label} data-goal={opt.label}>
              <button
                type="button"
                onClick={() => handleGoalClick(opt.label)}
                className={cn(
                  "relative w-full flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-all active:scale-[0.97]",
                  active
                    ? "border-[#C8FF4D]/30 bg-[#C8FF4D]/[0.06]"
                    : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]",
                )}
              >
                <div
                  className="size-10 shrink-0 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: active ? "#C8FF4D20" : "rgba(255,255,255,0.04)" }}
                >
                  <Icon size={16} style={{ color: active ? "#C8FF4D" : "rgba(255,255,255,0.3)" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-[12px] font-bold leading-tight truncate", active ? "text-foreground" : "text-foreground/60")}>
                    {opt.label}
                  </p>
                  {opt.desc && (
                    <p className="text-micro text-muted-foreground/60 mt-0.5 font-medium truncate">{opt.desc}</p>
                  )}
                </div>
                {active && (
                  <div className="absolute top-2 right-2 size-4 rounded-full flex items-center justify-center bg-[#C8FF4D]">
                    <Check size={8} className="text-[#0A0C0A]" strokeWidth={3} />
                  </div>
                )}
              </button>

              {active && isExam && (
                <GoalPanel title="Select your temporal window">
                  {TEMPORAL_PANEL_OPTIONS.map((o) => (
                    <GoalRadioRow
                      key={o.id}
                      active={temporal === o.id}
                      label={o.label}
                      onClick={() => onTemporal(o.id)}
                    />
                  ))}
                </GoalPanel>
              )}

              {active && isVedic && (
                <GoalPanel title="What's your goal with speed math?">
                  {VEDIC_USE_CASES.map((u) => (
                    <GoalRadioRow
                      key={u.id}
                      active={vedicUseCase === u.label}
                      label={u.label}
                      sub={u.desc}
                      onClick={() => onVedicUseCase(u.label)}
                    />
                  ))}
                </GoalPanel>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GoalPanel({ title, children }: { title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 14, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: "power3.out" },
      );
    }
  }, []);

  return (
    <div ref={ref} data-panel className="mt-2.5 w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-sm bg-[#C8FF4D]" />
        <p className="text-[9px] font-bold tracking-[0.14em] text-muted-foreground/55 uppercase">{title}</p>
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function GoalRadioRow({
  active,
  label,
  sub,
  onClick,
}: {
  active: boolean;
  label: string;
  sub?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-white/[0.03]"
    >
      <span className={cn("size-4 rounded-full border flex items-center justify-center shrink-0", active ? "border-[#C8FF4D]" : "border-white/[0.18]")}>
        {active && <span className="size-2 rounded-full bg-[#C8FF4D]" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[13px] font-semibold leading-tight", active ? "text-foreground" : "text-foreground/60")}>{label}</span>
        {sub && <span className="block text-micro text-muted-foreground/55 mt-0.5 font-medium">{sub}</span>}
      </span>
    </button>
  );
}

function StepTriggers({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <h2 className="text-[20px] font-black tracking-[-0.03em] text-foreground">Which describe you right now?</h2>
        <p className="text-[13px] text-muted-foreground/50 mt-1 font-medium">Pick all that apply</p>
      </div>
      <div className="flex flex-col gap-4">
        {TRIGGER_GROUPED.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-1 h-3 rounded-full" style={{ backgroundColor: group.color }} />
              <p className="text-[9px] font-bold tracking-[0.14em] text-muted-foreground/55 uppercase">
                {group.label}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.tags.map((tag) => {
                const active = value.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      onChange(active ? value.filter((t) => t !== tag) : [...value, tag])
                    }
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[10px] font-bold transition-all active:scale-95",
                      active
                        ? "text-[#0A0C0A] bg-[#C8FF4D]"
                        : "bg-white/[0.04] text-muted-foreground/50 border border-white/[0.06] hover:bg-white/[0.07]",
                    )}
                  >
                    {active && <Check size={8} strokeWidth={3} />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepDetails({
  sex,
  onSexChange,
  dob,
  onDobChange,
}: {
  sex: string | null;
  onSexChange: (v: string) => void;
  dob: { day: number; month: string; year: number };
  onDobChange: (fn: (prev: { day: number; month: string; year: number }) => { day: number; month: string; year: number }) => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="mb-5">
        <h2 className="text-[20px] font-black tracking-[-0.03em] text-foreground">Personal Details</h2>
        <p className="text-[13px] text-muted-foreground/50 mt-1.5 font-medium">Help us personalise your journey</p>
      </div>

      <p className="text-micro font-bold tracking-[0.14em] text-muted-foreground/60 mb-2.5 uppercase">Gender</p>
      <div className="flex gap-2.5 mb-6">
        {["Male", "Female"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSexChange(s)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-2xl border py-3.5 text-[13px] font-bold transition-all active:scale-[0.98]",
              sex === s
                ? "border-[#FF5C5C]/30 bg-[#FF5C5C]/10 text-[#FF5C5C]"
                : "border-white/[0.06] bg-white/[0.03] text-foreground/60 hover:bg-white/[0.05]",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="text-micro font-bold tracking-[0.14em] text-muted-foreground/60 mb-3 uppercase">Date of Birth</p>
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="flex">
          <ScrollColumn
            items={DAYS.map((d) => ({ value: String(d), label: String(d) }))}
            selected={String(dob.day)}
            onSelect={(v) => onDobChange((prev) => ({ ...prev, day: Number(v) }))}
            label="DD"
          />
          <div className="w-px bg-white/[0.06] my-3" />
          <ScrollColumn
            items={MONTHS.map((m) => ({ value: m, label: m.slice(0, 3) }))}
            selected={dob.month}
            onSelect={(v) => onDobChange((prev) => ({ ...prev, month: v }))}
            label="MM"
          />
          <div className="w-px bg-white/[0.06] my-3" />
          <ScrollColumn
            items={YEARS.map((y) => ({ value: String(y), label: String(y) }))}
            selected={String(dob.year)}
            onSelect={(v) => onDobChange((prev) => ({ ...prev, year: Number(v) }))}
            label="YYYY"
          />
        </div>
      </div>
    </div>
  );
}

function ScrollColumn({
  items,
  selected,
  onSelect,
  label,
}: {
  items: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
  label: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEM_H = 36;
  const VISIBLE = 3;
  const PAD = Math.floor(VISIBLE / 2);

  useEffect(() => {
    if (!containerRef.current) return;
    const idx = items.findIndex((i) => i.value === selected);
    if (idx >= 0) {
      containerRef.current.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
    }
  }, [selected, items]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const idx = Math.round(scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    if (items[clamped]?.value !== selected) {
      onSelect(items[clamped].value);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <p className="text-center text-[9px] font-bold tracking-[0.14em] text-muted-foreground/50 pt-2 pb-1">
        {label}
      </p>
      <div className="relative" style={{ height: ITEM_H * VISIBLE }}>
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[rgba(14,17,13,0.98)] to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[rgba(14,17,13,0.98)] to-transparent z-10 pointer-events-none" />
        <div
          className="absolute left-1 right-1 h-10 rounded-xl border z-0 pointer-events-none"
          style={{ top: PAD * ITEM_H, background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}
        />
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll scrollbar-thin snap-y snap-mandatory"
          style={{ scrollBehavior: "smooth" }}
        >
          <div style={{ height: PAD * ITEM_H }} />
          {items.map((item) => {
            const isActive = item.value === selected;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  onSelect(item.value);
                  const idx = items.findIndex((i) => i.value === item.value);
                  containerRef.current?.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
                }}
                className={cn(
                  "w-full flex items-center justify-center snap-center transition-all duration-200",
                  isActive ? "text-foreground font-bold text-[15px]" : "text-muted-foreground/30 text-[13px] font-medium",
                )}
                style={{ height: ITEM_H }}
              >
                {item.label}
              </button>
            );
          })}
          <div style={{ height: PAD * ITEM_H }} />
        </div>
      </div>
    </div>
  );
}

function CompletionScreen() {
  const store = useOnboardingStore();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boxRef.current) {
      gsap.fromTo(boxRef.current.children,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: "power2.out" },
      );
    }
  }, []);

  const name = store.firstName?.trim() || "Champion";

  const badges = [
    store.planId ? { l: "PLAN", v: PLANS.find((p) => p.id === store.planId)?.name ?? "Initiate" } : null,
    store.dailyMinutes ? { l: "DAILY", v: `${store.dailyMinutes} min` } : null,
    store.selectedDrill ? { l: "DRILL", v: DRILLS.find((d) => d.id === store.selectedDrill)?.label ?? "None" } : null,
  ].filter(Boolean);

  return (
    <div className="h-full flex flex-col justify-between py-5 text-center px-1">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="absolute -inset-8 rounded-full opacity-30 blur-2xl pointer-events-none" style={{ background: "radial-gradient(circle, rgba(167,139,250,0.45), transparent 70%)" }} />
          <CelebrationAvatar />
        </div>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#C8FF4D]/20 bg-[#C8FF4D]/[0.08] px-4 py-1.5">
          <Sparkles size={12} className="text-[#C8FF4D]" />
          <span className="text-micro font-bold tracking-[0.14em] uppercase text-[#C8FF4D]">Profile complete</span>
        </div>
        <h2 className="mt-4 text-[24px] font-black tracking-[-0.03em] text-foreground">
          You&apos;re all set, <span className="text-[#C8FF4D]">{name}</span>!
        </h2>
        <p className="mt-1.5 text-[12px] text-muted-foreground/40 font-medium">Let&apos;s start your fight</p>
      </div>

      <div ref={boxRef} className="relative overflow-hidden rounded-2xl border border-white/[0.05] px-4 py-5 mt-8">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.35), transparent)" }} />
        <div className="relative flex items-center justify-around gap-2">
          {[{ l: "PERSONA", v: store.persona || "Student" }, { l: "GOAL", v: store.goal || "Master math" }].map((item) => (
            <div key={item.l} className="flex flex-col items-center gap-1">
              <span className="text-[8px] font-bold tracking-[0.16em] text-muted-foreground/50 uppercase">{item.l}</span>
              <span className="text-[13px] font-bold text-foreground/70">{item.v}</span>
            </div>
          ))}
        </div>
        {badges.length > 0 ? (
          <div className="relative mt-4 flex items-center justify-around gap-2 border-t border-white/[0.05] pt-4">
            {badges.map((item) => (
              <div key={item!.l} className="flex flex-col items-center gap-1">
                <span className="text-[8px] font-bold tracking-[0.16em] text-muted-foreground/50 uppercase">{item!.l}</span>
                <span className="text-[12px] font-bold text-foreground/70">{item!.v}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="relative mt-4 border-t border-white/[0.05] pt-4 text-[11px] text-muted-foreground/45 font-medium">
            We&apos;ll now customise your daily plan &amp; story
          </p>
        )}
      </div>
    </div>
  );
}

function CelebrationAvatar() {
  const avatarRef = useRef<HTMLDivElement>(null);
  const sparkleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!avatarRef.current || !sparkleRef.current) return;
    const sparks = Array.from(sparkleRef.current.children);
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
    tl.to(avatarRef.current, { y: -7, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: 1 });
    sparks.forEach((s, i) => {
      const angle = (i / sparks.length) * Math.PI * 2;
      gsap.fromTo(s,
        { opacity: 0, scale: 0, x: 0, y: 0 },
        { opacity: [0, 1, 0] as never, scale: [0, 1, 0.4] as never, x: Math.cos(angle) * 34, y: Math.sin(angle) * 34, duration: 1.4, ease: "power1.out", repeat: -1, repeatDelay: 0.9, delay: i * 0.18 },
      );
    });
    return () => {
      tl.kill();
      sparks.forEach((s) => gsap.killTweensOf(s));
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      <div ref={sparkleRef} className="absolute inset-0 pointer-events-none">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="size-1.5 rounded-full" style={{ background: ["#A78BFA", "#22D3EE", "#A78BFA", "#22D3EE", "#A78BFA", "#22D3EE"][i] }} />
          </div>
        ))}
      </div>
      <div ref={avatarRef}>
        <div className="relative size-20 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.28), rgba(34,211,238,0.10))", border: "1px solid rgba(167,139,250,0.30)", boxShadow: "0 8px 30px rgba(139,92,246,0.18)" }}>
          <div className="flex items-center gap-3">
            <div className="size-2.5 rounded-full bg-[#A78BFA]" />
            <div className="size-2.5 rounded-full bg-[#A78BFA]" />
          </div>
          <div className="absolute bottom-5.5 left-1/2 -translate-x-1/2 w-5 h-2 rounded-b-full border-b-[1.5px] border-[#A78BFA]/70" />
          <div className="absolute -top-1.5 -right-1.5 text-micro text-[#A78BFA]">
            <Sparkles size={10} fill="currentColor" />
          </div>
        </div>
      </div>
    </div>
  );
}