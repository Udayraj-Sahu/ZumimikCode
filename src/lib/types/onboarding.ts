export type FocusMode = "sleep" | "sprint";

export type PlanId = "initiate" | "single-lane" | "dual-lane";

export type VedicUseCaseId = "kid" | "speed" | "exam" | "brain-gym";

export type DrillId = "speed-math" | "lightning-di" | "verbal-sprint" | "logical-reflex";

export const DRILLS: { id: DrillId; label: string; desc: string }[] = [
  { id: "speed-math", label: "Speed Math", desc: "Vedic shortcuts, timed reps" },
  { id: "lightning-di", label: "Lightning DI", desc: "Data interpretation under pressure" },
  { id: "verbal-sprint", label: "Verbal Sprint", desc: "RC + para-jumbles, timed" },
  { id: "logical-reflex", label: "Logical Reflex", desc: "LR pattern recognition" },
];

export const VEDIC_USE_CASES: { id: VedicUseCaseId; label: string; desc: string }[] = [
  { id: "kid", label: "Teaching My Kid", desc: "Guided teaching journey" },
  { id: "speed", label: "Lightning Mental Calc", desc: "Speed + accuracy training" },
  { id: "exam", label: "Competitive Exam", desc: "Speed under exam conditions" },
  { id: "brain-gym", label: "Brain Gym", desc: "Daily mental workout" },
];

export const REMINDER_TIMES = ["07:00", "13:00", "19:00", "22:00"];

export const DAILY_TIME_OPTIONS = [15, 30, 45, 60, 90];

export const PLANS: {
  id: PlanId;
  name: string;
  price: string;
  cadence: string;
  features: string[];
  highlight?: boolean;
}[] = [
  {
    id: "initiate",
    name: "Initiate",
    price: "Free",
    cadence: "forever",
    features: ["1 drill per day", "Daily streak tracking", "Basic leaderboard"],
  },
  {
    id: "single-lane",
    name: "Single Lane Pro",
    price: "₹399",
    cadence: "/month",
    features: [
      "Unlimited drills, one exam track",
      "Full adaptive engine",
      "Weekly performance report",
    ],
  },
  {
    id: "dual-lane",
    name: "Dual Lane Access",
    price: "₹649",
    cadence: "/month",
    features: [
      "Two exam tracks in parallel",
      "Priority drill matching",
      "1:1 mentor check-ins",
    ],
    highlight: true,
  },
];