export type AdaptiveTopic = {
  id: string;
  name: string;
  value: number;
  color: string;
};

const COLOR = ["#34D399", "#22D3EE", "#A78BFA", "#FBBF24", "#FB7185"];

export const ADAPTIVE_TOPICS_BY_DOMAIN: Record<string, AdaptiveTopic[]> = {
  gmat: [
    { id: "ps", name: "Problem Solving", value: 36, color: COLOR[0] },
    { id: "ds", name: "Data Sufficiency", value: 52, color: COLOR[1] },
    { id: "sc", name: "Sentence Correction", value: 44, color: COLOR[2] },
    { id: "cr", name: "Critical Reasoning", value: 61, color: COLOR[3] },
    { id: "rc", name: "Reading Comp.", value: 28, color: COLOR[4] },
  ],
  cat: [
    { id: "qa", name: "Quantitative Apt.", value: 40, color: COLOR[0] },
    { id: "lrdi", name: "LR & DI", value: 33, color: COLOR[1] },
    { id: "va", name: "Verbal Ability", value: 55, color: COLOR[2] },
  ],
  gre: [
    { id: "qc", name: "Quant Comparison", value: 48, color: COLOR[0] },
    { id: "ps", name: "Problem Solving", value: 42, color: COLOR[1] },
    { id: "tc", name: "Text Completion", value: 36, color: COLOR[2] },
    { id: "se", name: "Sentence Equivalence", value: 31, color: COLOR[3] },
    { id: "rc", name: "Reading Comp.", value: 25, color: COLOR[4] },
  ],
  banking: [
    { id: "numerical", name: "Numerical Ability", value: 50, color: COLOR[0] },
    { id: "reasoning", name: "Reasoning", value: 44, color: COLOR[1] },
    { id: "english", name: "English", value: 57, color: COLOR[2] },
    { id: "ga", name: "General Awareness", value: 30, color: COLOR[3] },
    { id: "computer", name: "Computer Knowledge", value: 63, color: COLOR[4] },
  ],
  "vedic-math": [
    { id: "addition", name: "Vedic Addition", value: 0, color: COLOR[0] },
    { id: "subtraction", name: "Vedic Subtraction", value: 0, color: COLOR[1] },
    { id: "multiplication", name: "Vedic Multiplication", value: 0, color: COLOR[2] },
    { id: "squares", name: "Squares & Bases", value: 0, color: COLOR[3] },
  ],
};

export function getAdaptiveTopics(domain: string): AdaptiveTopic[] {
  return ADAPTIVE_TOPICS_BY_DOMAIN[domain] ?? ADAPTIVE_TOPICS_BY_DOMAIN["cat"] ?? [];
}