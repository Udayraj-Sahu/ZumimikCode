"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
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
  Sparkles,
  ArrowRight,
  FileText,
  Clock,
  TrendingUp,
  Trophy,
  Swords,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";

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
const STEP_LABELS = ["Name", "Who", "Goal", "Vibe", "Details"];
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
    if (store.firstName && store.persona && store.goal) {
      setCompleted(true);
    }
  }, [store.firstName, store.persona, store.goal]);

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
    setTimeout(() => handleClose(), 2600);
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 px-5 pt-4 pb-2">
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-h-0 px-5", completed ? "overflow-hidden" : "overflow-y-auto pt-2 pb-4 scroll-smooth")} style={{ scrollbarWidth: "none" }}>
        {completed ? (
          <CompletionScreen />
        ) : (
          <div ref={contentRef} className="flex flex-col">
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
        <div className="sticky bottom-0 px-5 pb-5 pt-3">
          <div className="flex items-center justify-center gap-2 mb-3">
            {STEP_LABELS.map((label, i) => {
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div
                  key={i}
                  className={cn(
                    "rounded-full transition-all duration-400",
                    isActive ? "h-2 w-2" : isDone ? "h-1.5 w-1.5" : "h-1.5 w-1.5"
                  )}
                  style={{
                    background: isActive || isDone ? "#C8FF4D" : "rgba(255,255,255,0.15)",
                  }}
                />
              );
            })}
          </div>
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
              onClick={step === TOTAL_STEPS - 1 ? handleFinish : goNext}
              disabled={!canNext}
              className={cn(
                "size-10 rounded-full flex items-center justify-center transition-all active:scale-90",
                canNext
                  ? "text-[#0A0C0A]"
                  : "bg-white/[0.06] text-muted-foreground/20 cursor-not-allowed",
              )}
              style={canNext ? { background: "#C8FF4D" } : undefined}
            >
              {step === TOTAL_STEPS - 1 ? (
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

  if (inline) return panel;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        ref={panelRef}
        className="w-full max-w-md max-h-[90vh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-white/[0.06] shadow-2xl"
        style={{ background: "rgba(14,17,13,0.98)" }}
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
        <p className="mt-3 text-[12px] text-muted-foreground/35 font-medium">
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
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          const active = value === opt.label;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onSelect(opt.label)}
              className={cn(
                "relative flex items-center gap-2.5 rounded-2xl border p-3 text-left transition-all active:scale-[0.97]",
                active
                  ? "border-[#C8FF4D]/30 bg-[#C8FF4D]/[0.06]"
                  : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]",
              )}
            >
              <div
                className="size-9 shrink-0 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: active ? "#C8FF4D20" : "rgba(255,255,255,0.04)" }}
              >
                <Icon size={16} style={{ color: active ? "#C8FF4D" : "rgba(255,255,255,0.3)" }} />
              </div>
              <div className="min-w-0">
                <p className={cn("text-[11px] font-bold leading-tight truncate", active ? "text-foreground" : "text-foreground/60")}>
                  {opt.label}
                </p>
                {opt.desc && (
                  <p className="text-[9px] text-muted-foreground/30 mt-0.5 font-medium truncate">{opt.desc}</p>
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

function StepTriggers({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <h2 className="text-[20px] font-black tracking-[-0.03em] text-foreground">Which describe you right now?</h2>
        <p className="text-[13px] text-muted-foreground/50 mt-1 font-medium">Pick all that apply</p>
      </div>
      <div className="flex flex-col gap-3.5">
        {TRIGGER_GROUPED.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-3 rounded-full" style={{ backgroundColor: group.color }} />
              <p className="text-[9px] font-bold tracking-[0.14em] text-muted-foreground/35 uppercase">
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
                      "flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-bold transition-all active:scale-95",
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

      <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground/35 mb-2.5 uppercase">Gender</p>
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

      <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground/35 mb-3 uppercase">Date of Birth</p>
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
      <p className="text-center text-[9px] font-bold tracking-[0.14em] text-muted-foreground/25 pt-2 pb-1">
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
  const router = useRouter();
  const store = useOnboardingStore();
  const suggestions = [
    { icon: Swords, label: "Start Sprint", desc: "Instant quiz", color: "#34D399", bg: "rgba(52,211,153,0.12)", href: "/dashboard/configure-sprint" },
    { icon: FileText, label: "Mock Test", desc: "Full exam", color: "#F59E0B", bg: "rgba(245,158,11,0.12)", href: "/dashboard/questions" },
    { icon: Sparkles, label: "Techniques", desc: "Speed math", color: "#22D3EE", bg: "rgba(34,211,238,0.12)", href: "/dashboard/explorer" },
    { icon: Trophy, label: "Leaderboard", desc: "Rankings", color: "#A78BFA", bg: "rgba(167,139,250,0.12)", href: "/dashboard/leaderboard" },
  ];
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current) {
      gsap.fromTo(gridRef.current.children,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: "power2.out" },
      );
    }
  }, []);

  const name = store.firstName?.trim() || "Champion";

  return (
    <div className="h-full flex flex-col text-center px-1">
      <div className="flex flex-col items-center pt-6 pb-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#C8FF4D]/20 bg-[#C8FF4D]/[0.08] px-4 py-1.5">
          <Sparkles size={12} className="text-[#C8FF4D]" />
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#C8FF4D]">Profile complete</span>
        </div>
        <h2 className="mt-3 text-[19px] font-black tracking-[-0.03em] text-foreground">
          You&apos;re all set, <span className="text-[#C8FF4D]">{name}</span>!
        </h2>
        <p className="mt-1 text-[11px] text-muted-foreground/40 font-medium">Here&apos;s how to start your fight</p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] px-4 py-3 mb-4">
        <div className="relative flex items-center justify-around gap-2">
          {[{ l: "PERSONA", v: store.persona || "Student" }, { l: "GOAL", v: store.goal || "Master math" }].map((item) => (
            <div key={item.l} className="flex flex-col items-center gap-0.5">
              <span className="text-[7.5px] font-bold tracking-[0.16em] text-muted-foreground/30 uppercase">{item.l}</span>
              <span className="text-[10.5px] font-bold text-foreground/70">{item.v}</span>
            </div>
          ))}
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-10 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(200,255,77,0.4), transparent)" }} />
      </div>

      <div ref={gridRef} className="grid grid-cols-2 gap-2 w-full flex-1 content-start">
        {suggestions.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => router.push(item.href)}
            className="group flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/[0.05] bg-white/[0.02] py-3.5 transition-all hover:bg-white/[0.04] active:scale-95"
          >
            <div className="relative mb-1">
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" style={{ background: item.color }} />
              <div className="relative size-10 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110" style={{ background: item.bg }}>
                <item.icon size={17} color={item.color} />
              </div>
            </div>
            <span className="text-[10.5px] font-bold text-foreground/70 text-center leading-tight tracking-[0.01em]">{item.label}</span>
            <span className="text-[8.5px] text-muted-foreground/30 font-medium">{item.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
