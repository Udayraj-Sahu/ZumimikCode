import { Zap, Minus, X, Percent, Square, Shuffle } from "lucide-react";
import type { SprintTopic, SprintConfig } from "@/lib/types/sprint";

export const SPRINT_TOPICS: SprintTopic[] = [
  { id: "addition", label: "Rapid Addition", icon: Zap, color: "text-primary" },
  { id: "subtraction", label: "Fast Subtraction", icon: Minus, color: "text-secondary" },
  { id: "multiplication", label: "Speed Mult.", icon: X, color: "text-chart-4" },
  { id: "division", label: "Quick Division", icon: Percent, color: "text-chart-3" },
  { id: "squares", label: "Mental Squares", icon: Square, color: "text-chart-3" },
  { id: "mixed", label: "Mixed Challenge", icon: Shuffle, color: "text-foreground" },
];

export const SPRINT_CONFIG: SprintConfig = {
  lengths: [5, 10, 15],
  difficulties: ["Adaptive", "Beginner", "Advanced"],
};
