"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import {
  ChevronRight,
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
  PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";

const PERSONA_OPTIONS = [
  { label: "Student", icon: GraduationCap, color: "#34D399" },
  { label: "Working Professional", icon: Briefcase, color: "#22D3EE" },
  { label: "Job Seeker", icon: Search, color: "#A78BFA" },
  { label: "Parent", icon: Heart, color: "#FB7185" },
  { label: "Educator", icon: BookOpen, color: "#FBBF24" },
  { label: "Other", icon: Plus, color: "#8B9086" },
];

const GOAL_OPTIONS = [
  { label: "Prepare for CAT", icon: Target, color: "#34D399" },
  { label: "Prepare for GMAT", icon: Calculator, color: "#22D3EE" },
  { label: "Prepare for GRE", icon: BookOpen, color: "#A78BFA" },
  { label: "Master speed math", icon: Zap, color: "#FBBF24" },
  { label: "Help with my school stuff", icon: School, color: "#FB7185" },
  { label: "Just exploring", icon: Compass, color: "#8B9086" },
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

const TOTAL_STEPS = 5;

const STEP_ICONS = [User, Users, Target, Brain, ClipboardList];
const STEP_COLORS = ["#C8FF4D", "#22D3EE", "#34D399", "#A855F7", "#FF5C5C"];

type Props = { onClose: () => void; inline?: boolean };

export function OnboardingModal({ onClose, inline }: Props) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [completed, setCompleted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(0);

  const store = useOnboardingStore();
  const [localFirstName, setLocalFirstName] = useState(store.firstName);
  const [localPersona, setLocalPersona] = useState<string | null>(store.persona);
  const [localGoal, setLocalGoal] = useState<string | null>(store.goal);
  const [localTriggers, setLocalTriggers] = useState<string[]>(store.triggers);
  const [localSex, setLocalSex] = useState<string | null>(store.sex);
  const [localDob, setLocalDob] = useState(store.dob);

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

  const handleClose = () => {
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
    store.finishOnboarding();
    setCompleted(true);
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" });
    }
    setTimeout(() => handleClose(), 1200);
  };

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
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

  const canNext =
    (step === 0 && localFirstName.trim().length > 0) ||
    (step === 1 && localPersona !== null) ||
    (step === 2 && localGoal !== null) ||
    step === 3 ||
    step === 4;

  const panel = (
    <>
      {/* Header with dot indicators */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm px-5 pt-4 pb-3 border-b border-border/40">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handleClose}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground/50 hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
              const StepIcon = STEP_ICONS[i];
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-center rounded-full transition-all duration-300",
                    isActive
                      ? "size-8 bg-primary/15 ring-2 ring-primary/40"
                      : isDone
                        ? "size-6 bg-primary/10"
                        : "size-6 bg-muted",
                  )}
                >
                  {isDone ? (
                    <Check size={10} className="text-primary" />
                  ) : (
                    <StepIcon
                      size={isActive ? 14 : 10}
                      className={cn(
                        "transition-colors duration-300",
                        isActive ? "text-primary" : "text-muted-foreground/40",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 min-h-[320px] flex flex-col overflow-hidden">
          {completed ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="grid size-20 place-items-center rounded-full bg-primary/15">
                <PartyPopper size={36} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="text-fluid-lg font-black text-foreground">You&apos;re all set!</p>
                <p className="text-fluid-xs text-muted-foreground/60 mt-1">Let&apos;s start learning</p>
              </div>
              <div className="w-full mt-2 space-y-2.5">
                {[
                  { icon: Target, label: "Start a Sprint", desc: "Test your skills with a timed quiz", color: "#34D399" },
                  { icon: BookOpen, label: "Explore Techniques", desc: "Browse methods to solve faster", color: "#F59E0B" },
                  { icon: Zap, label: "Try Practice Mode", desc: "Step-by-step guided exercises", color: "#22D3EE" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/50 px-4 py-3">
                    <div className="size-8 shrink-0 rounded-lg flex items-center justify-center" style={{ background: item.color + "18" }}>
                      <item.icon size={14} style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-foreground">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground/40">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        ) : (
          <div ref={contentRef} className="flex-1 flex flex-col">
            {step === 0 && (
              <StepName
                value={localFirstName}
                onChange={setLocalFirstName}
                onNext={goNext}
              />
            )}
            {step === 1 && (
              <StepSingleSelect
                title="What describes you?"
                subtitle="Pick the one that fits best"
                options={PERSONA_OPTIONS}
                value={localPersona}
                onSelect={setLocalPersona}
              />
            )}
            {step === 2 && (
              <StepSingleSelect
                title="What brings you here?"
                subtitle="We'll tailor content to your goal"
                options={GOAL_OPTIONS}
                value={localGoal}
                onSelect={setLocalGoal}
              />
            )}
            {step === 3 && (
              <StepTriggers
                value={localTriggers}
                onChange={setLocalTriggers}
              />
            )}
            {step === 4 && (
              <StepDetails
                sex={localSex}
                onSexChange={setLocalSex}
                dob={localDob}
                onDobChange={setLocalDob}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!completed && (
        <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm px-5 pb-5 pt-3 border-t border-border/40 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={goPrev}
              className="flex items-center gap-1.5 rounded-2xl border border-border/60 bg-background px-4 py-3.5 text-fluid-xs font-bold text-foreground/80 outline-none transition-all hover:bg-accent/40 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft size={14} />
              Back
            </button>
          )}
          <button
            type="button"
            onClick={step === TOTAL_STEPS - 1 ? handleFinish : goNext}
            disabled={!canNext}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-fluid-sm font-bold outline-none transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring",
              canNext
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-muted text-muted-foreground/40 cursor-not-allowed",
            )}
          >
            {step === TOTAL_STEPS - 1 ? "Finish" : "Continue"}
            {step < TOTAL_STEPS - 1 && <ChevronRight size={14} />}
          </button>
        </div>
      )}
    </>
  );

  if (inline) return panel;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        ref={panelRef}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-card rounded-t-3xl sm:rounded-3xl border border-border/60 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {panel}
      </div>
    </div>,
    document.body,
  );
}

/* ── Step sub-components ── */

function StepName({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-6">
        <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 mb-3">
          <User size={22} className="text-primary" />
        </div>
        <h2 className="text-fluid-lg font-black text-foreground">What&apos;s your first name?</h2>
        <p className="text-fluid-xs text-muted-foreground/60 mt-1">So we can personalise your experience</p>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && value.trim().length > 0) onNext(); }}
        placeholder="Enter your first name"
        className="w-full rounded-2xl border border-border/60 bg-background px-4 py-4 text-fluid-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
        autoFocus
      />
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
  options: { label: string; icon: any; color: string }[];
  value: string | null;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-5">
        <h2 className="text-fluid-lg font-black text-foreground">{title}</h2>
        <p className="text-fluid-xs text-muted-foreground/60 mt-1">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-2.5">
        {options.map((opt) => {
          const Icon = opt.icon;
          const active = value === opt.label;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onSelect(opt.label)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-4 text-left text-fluid-sm font-bold transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary bg-primary/5 shadow-[0_0_0_1px_var(--primary)]"
                  : "border-border/60 bg-background hover:border-border hover:bg-accent/30",
              )}
            >
              <div
                className="grid size-10 shrink-0 place-items-center rounded-xl"
                style={{ backgroundColor: opt.color + "1A" }}
              >
                <Icon size={18} style={{ color: opt.color }} />
              </div>
              <span className={cn("flex-1", active ? "text-primary" : "text-foreground")}>
                {opt.label}
              </span>
              {active && (
                <div className="grid size-6 place-items-center rounded-full bg-primary">
                  <Check size={12} className="text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepTriggers({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-5">
        <h2 className="text-fluid-lg font-black text-foreground">Which describe you right now?</h2>
        <p className="text-fluid-xs text-muted-foreground/60 mt-1">Pick all that apply</p>
      </div>
      <div className="flex flex-col gap-5">
        {TRIGGER_GROUPED.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className="w-1 h-4 rounded-full"
                style={{ backgroundColor: group.color }}
              />
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground/50">
                {group.label.toUpperCase()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
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
                      "flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-fluid-xs font-bold transition-all active:scale-[0.95] focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground/70 hover:bg-accent",
                    )}
                  >
                    {active && <Check size={11} strokeWidth={3} />}
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
    <div className="flex-1 flex flex-col">
      <div className="mb-5">
        <h2 className="text-fluid-lg font-black text-foreground">Personal Details</h2>
        <p className="text-fluid-xs text-muted-foreground/60 mt-1">Help us personalise your journey</p>
      </div>

      <p className="text-[10px] font-bold tracking-widest text-muted-foreground/50 mb-2.5">GENDER</p>
      <div className="flex gap-2.5 mb-6">
        {["Male", "Female"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSexChange(s)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-2xl border py-3.5 text-fluid-xs font-bold transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring",
              sex === s
                ? "border-primary bg-primary/5 text-primary shadow-[0_0_0_1px_var(--primary)]"
                : "border-border/60 bg-background text-foreground hover:bg-accent/30",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="text-[10px] font-bold tracking-widest text-muted-foreground/50 mb-3">DATE OF BIRTH</p>
      <div className="rounded-2xl border border-border/60 bg-background overflow-hidden">
        <div className="flex">
          {/* Day */}
          <ScrollColumn
            items={DAYS.map((d) => ({ value: String(d), label: String(d) }))}
            selected={String(dob.day)}
            onSelect={(v) => onDobChange((prev) => ({ ...prev, day: Number(v) }))}
            label="DD"
          />
          {/* Divider */}
          <div className="w-px bg-border/40 my-3" />
          {/* Month */}
          <ScrollColumn
            items={MONTHS.map((m) => ({ value: m, label: m.slice(0, 3) }))}
            selected={dob.month}
            onSelect={(v) => onDobChange((prev) => ({ ...prev, month: v }))}
            label="MM"
          />
          {/* Divider */}
          <div className="w-px bg-border/40 my-3" />
          {/* Year */}
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
      <p className="text-center text-[9px] font-bold tracking-widest text-muted-foreground/30 pt-2 pb-1">
        {label}
      </p>
      <div className="relative" style={{ height: ITEM_H * VISIBLE }}>
        {/* Top/bottom fade masks */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
        {/* Selection highlight */}
        <div
          className="absolute left-1 right-1 h-10 rounded-xl bg-primary/8 border border-primary/20 z-0 pointer-events-none"
          style={{ top: PAD * ITEM_H }}
        />
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll scrollbar-thin snap-y snap-mandatory"
          style={{ scrollBehavior: "smooth" }}
        >
          {/* Top padding */}
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
                  isActive ? "text-foreground font-bold text-fluid-sm" : "text-muted-foreground/40 text-fluid-xs font-medium",
                )}
                style={{ height: ITEM_H }}
              >
                {item.label}
              </button>
            );
          })}
          {/* Bottom padding */}
          <div style={{ height: PAD * ITEM_H }} />
        </div>
      </div>
    </div>
  );
}
