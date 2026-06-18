import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type OnboardingState = {
  currentStep: number;
  name: string;
  email: string;
  phone: string;
  authMethod: "google" | "phone" | null;
  targetExam: string;
  level: string;
  isOnboarded: boolean;

  setAuthData: (data: { name?: string; email?: string; phone?: string; authMethod: "google" | "phone" }) => void;
  setTargetExam: (exam: string) => void;
  setLevel: (level: string) => void;
  nextStep: () => void;
  completeOnboarding: () => void;
  reset: () => void;
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

      completeOnboarding: () => set({ isOnboarded: true }),

      reset: () => set(initial),
    }),
    {
      name: "exam-arena-onboarding",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage),
      ),
    },
  ),
);
