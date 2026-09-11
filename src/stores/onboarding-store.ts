import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeLocalStorage } from "@/lib/browser";
import type { FocusMode, PlanId, VedicUseCaseId, DrillId } from "@/lib/types/onboarding";

export function examIdForGoal(goal: string | null): string {
  if (goal?.includes("CAT")) return "cat";
  if (goal?.includes("GMAT")) return "gmat";
  if (goal?.includes("GRE")) return "gre";
  if (goal?.toLowerCase().includes("speed math")) return "vedic-math";
  return "";
}

type OnboardingState = {
  currentStep: number;
  name: string;
  email: string;
  phone: string;
  authMethod: "google" | "phone" | null;
  targetExam: string;
  level: string;
  isOnboarded: boolean;
  autoSlidePaused: boolean;
  firstName: string;
  persona: string | null;
  goal: string | null;
  triggers: string[];
  sex: string | null;
  dob: { day: number; month: string; year: number };
  activePreps: string[];
  activeLearnDomain: string;
  examDates: Record<string, string>;
  temporalWindow: "this_year" | "whenever" | "not_sure" | null;
  adaptiveConfigured: boolean;
  hookSeen: boolean;
  justExploring: boolean;
  selectedDrill: DrillId | null;
  wantsDrills: boolean;
  reminderTime: string;
  focusMode: FocusMode;
  dailyMinutes: number | null;
  planId: PlanId | null;
  vedicUseCase: VedicUseCaseId | null;

  setAuthData: (data: { name?: string; email?: string; phone?: string; authMethod: "google" | "phone" }) => void;
  setTargetExam: (exam: string) => void;
  setLevel: (level: string) => void;
  nextStep: () => void;
  setCurrentStep: (step: number) => void;
  completeOnboarding: () => void;
  finishOnboarding: () => void;
  reset: () => void;
  setAutoSlidePaused: (paused: boolean) => void;
  setFirstName: (name: string) => void;
  setPersona: (persona: string | null) => void;
  setGoal: (goal: string | null) => void;
  toggleTrigger: (trigger: string) => void;
  setSex: (sex: string | null) => void;
  setDob: (dob: { day: number; month: string; year: number }) => void;
  addActivePrep: (prep: string) => void;
  removeActivePrep: (prep: string) => void;
  setActiveLearnDomain: (domain: string) => void;
  setExamDate: (domain: string, date: string) => void;
  setTemporalWindow: (window: "this_year" | "whenever" | "not_sure" | null) => void;
  setAdaptiveConfigured: (configured: boolean) => void;
  setHookSeen: (seen: boolean) => void;
  setJustExploring: (exploring: boolean) => void;
  setSelectedDrill: (drill: DrillId | null) => void;
  setWantsDrills: (wants: boolean) => void;
  setReminderTime: (time: string) => void;
  setFocusMode: (mode: FocusMode) => void;
  setDailyMinutes: (minutes: number | null) => void;
  setPlanId: (plan: PlanId | null) => void;
  setVedicUseCase: (useCase: VedicUseCaseId | null) => void;
};

const initial = {
  currentStep: 0,
  name: "",
  email: "",
  phone: "",
  authMethod: null as "google" | "phone" | null,
  targetExam: "",
  level: "",
  isOnboarded: false,
  autoSlidePaused: false,
  firstName: "",
  persona: null as string | null,
  goal: null as string | null,
  triggers: [] as string[],
  sex: null as string | null,
  dob: { day: 1, month: "January", year: 2000 },
  activePreps: [] as string[],
  activeLearnDomain: "",
  examDates: {} as Record<string, string>,
  temporalWindow: null as "this_year" | "whenever" | "not_sure" | null,
  adaptiveConfigured: false,
  hookSeen: false,
  justExploring: false,
  selectedDrill: null as DrillId | null,
  wantsDrills: false,
  reminderTime: "19:00",
  focusMode: "sprint" as FocusMode,
  dailyMinutes: null as number | null,
  planId: null as PlanId | null,
  vedicUseCase: null as VedicUseCaseId | null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initial,

      setAuthData: (data) =>
        set((s) => ({
          ...s,
          name: data.name ?? s.name,
          email: data.email ?? s.email,
          phone: data.phone ?? s.phone,
          authMethod: data.authMethod,
        })),

      setTargetExam: (exam) => set({ targetExam: exam }),
      setLevel: (level) => set({ level }),

      nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
      setCurrentStep: (step) => set({ currentStep: step }),

      completeOnboarding: () => set({ isOnboarded: true }),

      reset: () => set(initial),

      setAutoSlidePaused: (paused: boolean) => set({ autoSlidePaused: paused }),

      setFirstName: (name) => set({ firstName: name }),
      setPersona: (persona) => set({ persona }),
      setGoal: (goal) => set({ goal }),
      toggleTrigger: (trigger) =>
        set((s) => ({
          triggers: s.triggers.includes(trigger)
            ? s.triggers.filter((t) => t !== trigger)
            : [...s.triggers, trigger],
        })),
      setSex: (sex) => set({ sex }),
      setDob: (dob) => set({ dob }),
      addActivePrep: (prep) =>
        set((s) => ({
          activePreps: s.activePreps.includes(prep)
            ? s.activePreps
            : [...s.activePreps, prep],
        })),
      removeActivePrep: (prep) =>
        set((s) => ({
          activePreps: s.activePreps.filter((p) => p !== prep),
        })),
      setActiveLearnDomain: (domain) => set({ activeLearnDomain: domain }),
      setExamDate: (domain, date) =>
        set((s) => ({
          examDates: { ...s.examDates, [domain]: date },
        })),
      setTemporalWindow: (temporalWindow) => set({ temporalWindow }),
      setAdaptiveConfigured: (adaptiveConfigured) => set({ adaptiveConfigured }),
      setHookSeen: (hookSeen) => set({ hookSeen }),
      setJustExploring: (justExploring) => set({ justExploring }),
      setSelectedDrill: (selectedDrill) => set({ selectedDrill }),
      setWantsDrills: (wantsDrills) => set({ wantsDrills }),
      setReminderTime: (reminderTime) => set({ reminderTime }),
      setFocusMode: (focusMode) => set({ focusMode }),
      setDailyMinutes: (dailyMinutes) => set({ dailyMinutes }),
      setPlanId: (planId) => set({ planId }),
      setVedicUseCase: (vedicUseCase) => set({ vedicUseCase }),
      finishOnboarding: () => set({ isOnboarded: true }),
    }),
    {
      name: "exam-arena-onboarding",
      storage: createJSONStorage(() => safeLocalStorage),
      merge: (persisted, current) => ({ ...current, ...(persisted as Partial<OnboardingState>) }),
    },
  ),
);
