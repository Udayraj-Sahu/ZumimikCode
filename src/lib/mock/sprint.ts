import { Zap, Minus, X, Percent, Square, Shuffle, Calculator, BrainCircuit, BookOpen, ListChecks, BarChart3, Sigma, FileText, Globe, Monitor } from "lucide-react";
import type { SprintTopic, SprintConfig } from "@/lib/types/sprint";

const SPRINT_TOPICS_BY_DOMAIN: Record<string, SprintTopic[]> = {
  "vedic-math": [
    { id: "addition", label: "Rapid Addition", icon: Zap, color: "text-primary" },
    { id: "subtraction", label: "Fast Subtraction", icon: Minus, color: "text-secondary" },
    { id: "multiplication", label: "Speed Mult.", icon: X, color: "text-chart-4" },
    { id: "division", label: "Quick Division", icon: Percent, color: "text-chart-3" },
    { id: "squares", label: "Mental Squares", icon: Square, color: "text-chart-3" },
    { id: "mixed", label: "Mixed Challenge", icon: Shuffle, color: "text-foreground" },
  ],
  gmat: [
    { id: "ps", label: "Problem Solving", icon: Calculator, color: "text-chart-3" },
    { id: "ds", label: "Data Sufficiency", icon: ListChecks, color: "text-chart-4" },
    { id: "sc", label: "Sentence Correction", icon: BookOpen, color: "text-primary" },
    { id: "cr", label: "Critical Reasoning", icon: BrainCircuit, color: "text-chart-2" },
    { id: "rc", label: "Reading Comp.", icon: BookOpen, color: "text-chart-3" },
  ],
  cat: [
    { id: "qa", label: "Quantitative Apt.", icon: Calculator, color: "text-chart-3" },
    { id: "lrdi", label: "LR & DI", icon: BarChart3, color: "text-chart-4" },
    { id: "va", label: "Verbal Ability", icon: BookOpen, color: "text-primary" },
  ],
  gre: [
    { id: "qc", label: "Quant Comparison", icon: Minus, color: "text-chart-3" },
    { id: "ps", label: "Problem Solving", icon: Calculator, color: "text-chart-4" },
    { id: "tc", label: "Text Completion", icon: FileText, color: "text-primary" },
    { id: "se", label: "Sentence Equivalence", icon: Sigma, color: "text-chart-2" },
    { id: "rc", label: "Reading Comp.", icon: BookOpen, color: "text-chart-3" },
  ],
  banking: [
    { id: "numerical", label: "Numerical Ability", icon: Calculator, color: "text-chart-3" },
    { id: "reasoning", label: "Reasoning", icon: BrainCircuit, color: "text-chart-4" },
    { id: "english", label: "English", icon: BookOpen, color: "text-primary" },
    { id: "ga", label: "General Awareness", icon: Globe, color: "text-chart-2" },
    { id: "computer", label: "Computer Knowledge", icon: Monitor, color: "text-chart-3" },
  ],
};

export const SPRINT_CONFIG: SprintConfig = {
  lengths: [5, 10, 15],
  difficulties: ["Adaptive", "Beginner", "Advanced"],
};

export function getTopicsByDomain(domain: string): SprintTopic[] {
  return SPRINT_TOPICS_BY_DOMAIN[domain] ?? SPRINT_TOPICS_BY_DOMAIN["vedic-math"] ?? [];
}

export const SPRINT_TOPICS = getTopicsByDomain("vedic-math");
