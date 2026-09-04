import type { MockPaper } from "@/lib/types/mock-exam";

function buildPaper(
  base: Omit<MockPaper, "totalQuestions" | "durationMinutes">,
): MockPaper {
  return {
    ...base,
    totalQuestions: base.sections.reduce((sum, s) => sum + s.questions, 0),
    durationMinutes: base.sections.reduce((sum, s) => sum + s.minutes, 0),
  };
}

const CAT_PAPERS: MockPaper[] = [
  buildPaper({
    id: "cat-2025-slot1",
    domain: "cat",
    title: "CAT 2025 Slot 1 Question Paper",
    shortLabel: "2025 · Slot 1",
    description: "Full-length CAT mock with VARC, DILR and QA sections.",
    sections: [
      { id: "varc", label: "VARC", topic: "va", questions: 24, minutes: 40 },
      { id: "dilr", label: "DILR", topic: "lrdi", questions: 20, minutes: 40 },
      { id: "qa", label: "QA", topic: "qa", questions: 22, minutes: 40 },
    ],
    difficulty: "Moderate",
    accent: "#A78BFA",
  }),
  buildPaper({
    id: "cat-2024-slot2",
    domain: "cat",
    title: "CAT 2024 Slot 2 Question Paper",
    shortLabel: "2024 · Slot 2",
    description: "Past paper with a balanced split across all three sections.",
    sections: [
      { id: "varc", label: "VARC", topic: "va", questions: 24, minutes: 40 },
      { id: "dilr", label: "DILR", topic: "lrdi", questions: 20, minutes: 40 },
      { id: "qa", label: "QA", topic: "qa", questions: 22, minutes: 40 },
    ],
    difficulty: "Moderate",
    accent: "#34D399",
  }),
  buildPaper({
    id: "cat-section-quant",
    domain: "cat",
    title: "CAT Quant Sectional",
    shortLabel: "Sectional · QA",
    description: "A timed Quant-only drill to sharpen your QA speed.",
    sections: [{ id: "qa", label: "QA", topic: "qa", questions: 20, minutes: 30 }],
    difficulty: "Advanced",
    accent: "#FBBF24",
  }),
];

const GMAT_PAPERS: MockPaper[] = [
  buildPaper({
    id: "gmat-2025-official",
    domain: "gmat",
    title: "GMAT Focus Official Mock",
    shortLabel: "Official Mock",
    description: "Full-length GMAT Focus with Quant, Verbal and Data Insights.",
    sections: [
      { id: "quant", label: "Quant", topic: "ps", questions: 21, minutes: 45 },
      { id: "verbal", label: "Verbal", topic: "cr", questions: 23, minutes: 45 },
      { id: "di", label: "Data Insights", topic: "ds", questions: 20, minutes: 45 },
    ],
    difficulty: "Moderate",
    accent: "#34D399",
  }),
  buildPaper({
    id: "gmat-quant-drill",
    domain: "gmat",
    title: "GMAT Quant Speed Drill",
    shortLabel: "Drill · Quant",
    description: "Problem solving + data sufficiency in one timed set.",
    sections: [
      { id: "ps", label: "Problem Solving", topic: "ps", questions: 15, minutes: 25 },
      { id: "ds", label: "Data Sufficiency", topic: "ds", questions: 10, minutes: 20 },
    ],
    difficulty: "Advanced",
    accent: "#FBBF24",
  }),
];

const GRE_PAPERS: MockPaper[] = [
  buildPaper({
    id: "gre-2025-practice",
    domain: "gre",
    title: "GRE PowerPrep Practice Test",
    shortLabel: "PowerPrep",
    description: "Full-length GRE with Quantitative and Verbal Reasoning.",
    sections: [
      { id: "q1", label: "Quant 1", topic: "ps", questions: 20, minutes: 35 },
      { id: "v1", label: "Verbal 1", topic: "rc", questions: 20, minutes: 30 },
      { id: "q2", label: "Quant 2", topic: "qc", questions: 20, minutes: 35 },
      { id: "v2", label: "Verbal 2", topic: "tc", questions: 20, minutes: 30 },
    ],
    difficulty: "Moderate",
    accent: "#A78BFA",
  }),
];

const BANKING_PAPERS: MockPaper[] = [
  buildPaper({
    id: "bank-prelims-2025",
    domain: "banking",
    title: "Bank Prelims Mock 2025",
    shortLabel: "Prelims · 2025",
    description: "Sectional bank prelims covering quant, reasoning and English.",
    sections: [
      { id: "quant", label: "Quantitative", topic: "numerical", questions: 20, minutes: 20 },
      { id: "reasoning", label: "Reasoning", topic: "reasoning", questions: 20, minutes: 20 },
      { id: "english", label: "English", topic: "english", questions: 20, minutes: 20 },
    ],
    difficulty: "Moderate",
    accent: "#34D399",
  }),
];

const VEDIC_PAPERS: MockPaper[] = [
  buildPaper({
    id: "vedic-speed-test",
    domain: "vedic-math",
    title: "Vedic Math Speed Test",
    shortLabel: "Speed Test",
    description: "Timed arithmetic drills across addition to mental squares.",
    sections: [
      { id: "add", label: "Addition", topic: "addition", questions: 10, minutes: 5 },
      { id: "mul", label: "Multiplication", topic: "multiplication", questions: 10, minutes: 5 },
      { id: "squares", label: "Squares", topic: "squares", questions: 8, minutes: 4 },
    ],
    difficulty: "Beginner",
    accent: "#22D3EE",
  }),
];

export const MOCK_PAPERS_BY_DOMAIN: Record<string, MockPaper[]> = {
  "vedic-math": VEDIC_PAPERS,
  gmat: GMAT_PAPERS,
  cat: CAT_PAPERS,
  gre: GRE_PAPERS,
  banking: BANKING_PAPERS,
};

export function getMockPapersByDomain(domain?: string): MockPaper[] {
  const d = domain ?? "cat";
  return MOCK_PAPERS_BY_DOMAIN[d] ?? MOCK_PAPERS_BY_DOMAIN["cat"] ?? [];
}

export function getMockPaperById(id: string): MockPaper | undefined {
  for (const papers of Object.values(MOCK_PAPERS_BY_DOMAIN)) {
    const found = papers.find((p) => p.id === id);
    if (found) return found;
  }
  return undefined;
}
