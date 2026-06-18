export type AuthMethod = "google" | "phone";

export type OnboardingData = {
  name: string;
  email: string;
  phone: string;
  authMethod: AuthMethod | null;
  targetExam: string;
  level: string;
  isOnboarded: boolean;
};
