import type { SolveAlongTemplate } from "@/lib/types/template";

export const SAMPLE_TEMPLATES: SolveAlongTemplate[] = [
  // ── VEDIC MATH ──────────────────────────────────────────
  {
    id: "mult-764x38",
    domain: "vedic-math",
    concept: { technique_name: "Nikhilam Multiplication", category: "multiplication" },
    difficulty: 3,
    expected_time: 45,
    visual_scaffold: { type: "arrow_matrix" },
    examples: [
      {
        problem_statement: "Multiply 764 by 38",
        solution: [
          { step_num: 1, operation: "764 × 8 = 6112" },
          { step_num: 2, operation: "764 × 3 = 2292" },
          { step_num: 3, operation: "6112 + 22920 = 29032" },
        ],
      },
    ],
    key_reminders: ["Multiply each digit of bottom by all digits of top", "Shift each partial product one place left"],
    common_mistakes: ["Forgetting to add carried digits", "Aligning partial products incorrectly"],
  },
  {
    id: "mult-97x94",
    domain: "vedic-math",
    concept: { technique_name: "Nikhilam Multiplication", category: "multiplication" },
    difficulty: 2,
    expected_time: 30,
    visual_scaffold: { type: "arrow_matrix" },
    examples: [
      {
        problem_statement: "Multiply 97 by 94",
        solution: [
          { step_num: 1, operation: "Both close to 100 — deviations: -3, -6" },
          { step_num: 2, operation: "97 - 6 = 91 (or 94 - 3 = 91)" },
          { step_num: 3, operation: "-3 × -6 = 18" },
          { step_num: 4, operation: "91 | 18 = 9118" },
        ],
      },
    ],
    key_reminders: ["Find deviations from nearest base (10, 100, 1000)", "Cross-subtract for left part, multiply deviations for right part"],
    common_mistakes: ["Sign errors when deviations are negative", "Right part must have same digits as base has zeros"],
  },
  {
    id: "mult-123x456",
    domain: "vedic-math",
    concept: { technique_name: "Vertical & Crosswise", category: "multiplication" },
    difficulty: 4,
    expected_time: 60,
    visual_scaffold: { type: "arrow_matrix" },
    examples: [
      {
        problem_statement: "Multiply 123 by 456",
        solution: [
          { step_num: 1, operation: "3 × 6 = 18 → write 8, carry 1" },
          { step_num: 2, operation: "2×6 + 3×5 = 12 + 15 = 27 + carry 1 = 28 → write 8, carry 2" },
          { step_num: 3, operation: "1×6 + 2×5 + 3×4 = 6 + 10 + 12 = 28 + carry 2 = 30 → write 0, carry 3" },
          { step_num: 4, operation: "1×5 + 2×4 = 5 + 8 = 13 + carry 3 = 16 → write 6, carry 1" },
          { step_num: 5, operation: "1×4 = 4 + carry 1 = 5" },
          { step_num: 6, operation: "Answer: 56088" },
        ],
      },
    ],
    key_reminders: ["Work digit by digit from right to left", "Keep track of carries carefully"],
    common_mistakes: ["Skipping carries", "Mixing up which digits to multiply at each step"],
  },
  {
    id: "div-84by7",
    domain: "vedic-math",
    concept: { technique_name: "Direct Division", category: "division" },
    difficulty: 2,
    expected_time: 30,
    visual_scaffold: { type: "place_value_chart" },
    examples: [
      {
        problem_statement: "Divide 84 by 7",
        solution: [
          { step_num: 1, operation: "7 into 8 goes 1, remainder 1" },
          { step_num: 2, operation: "Bring down 4 → 14" },
          { step_num: 3, operation: "7 into 14 goes 2, remainder 0" },
        ],
      },
    ],
    key_reminders: ["Work from left to right, one digit at a time", "Bring down the next digit after each step"],
    common_mistakes: ["Dividing the whole number at once instead of digit by digit"],
  },
  {
    id: "div-256by16",
    domain: "vedic-math",
    concept: { technique_name: "Direct Division", category: "division" },
    difficulty: 3,
    expected_time: 40,
    visual_scaffold: { type: "place_value_chart" },
    examples: [
      {
        problem_statement: "Divide 256 by 16",
        solution: [
          { step_num: 1, operation: "16 into 2 goes 0 → take 25" },
          { step_num: 2, operation: "16 into 25 goes 1, remainder 9" },
          { step_num: 3, operation: "Bring down 6 → 96" },
          { step_num: 4, operation: "16 into 96 goes 6, remainder 0" },
        ],
      },
    ],
    key_reminders: ["If divisor is larger than first digit, take first two digits"],
    common_mistakes: ["Forgetting to check if first digit is smaller than divisor"],
  },
  {
    id: "div-1000by8",
    domain: "vedic-math",
    concept: { technique_name: "Direct Division", category: "division" },
    difficulty: 2,
    expected_time: 25,
    visual_scaffold: { type: "place_value_chart" },
    examples: [
      {
        problem_statement: "Divide 1000 by 8",
        solution: [
          { step_num: 1, operation: "8 into 1 goes 0 → take 10" },
          { step_num: 2, operation: "8 into 10 goes 1, remainder 2" },
          { step_num: 3, operation: "Bring down 0 → 20" },
          { step_num: 4, operation: "8 into 20 goes 2, remainder 4" },
          { step_num: 5, operation: "Bring down 0 → 40" },
          { step_num: 6, operation: "8 into 40 goes 5, remainder 0" },
        ],
      },
    ],
    key_reminders: ["Bring down one digit at a time", "The quotient builds digit by digit"],
    common_mistakes: ["Skipping steps when digit is smaller than divisor"],
  },

  // ── GMAT ────────────────────────────────────────────────
  {
    id: "gmat-ps-speed-1",
    domain: "gmat",
    concept: { technique_name: "Speed & Distance", category: "problem_solving" },
    difficulty: 3,
    expected_time: 90,
    visual_scaffold: { type: "number_line" },
    examples: [
      {
        problem_statement: "A car travels 240 miles at 60 mph. How long does the trip take?",
        solution: [
          { step_num: 1, operation: "Time = Distance ÷ Speed" },
          { step_num: 2, operation: "Time = 240 ÷ 60" },
          { step_num: 3, operation: "Time = 4 hours", result: "4" },
        ],
      },
    ],
    key_reminders: ["Use the formula Distance = Rate × Time", "Check units match"],
    common_mistakes: ["Multiplying instead of dividing", "Forgetting to convert units"],
  },
  {
    id: "gmat-ps-work-1",
    domain: "gmat",
    concept: { technique_name: "Work Rate", category: "problem_solving" },
    difficulty: 4,
    expected_time: 120,
    visual_scaffold: { type: "arrow_matrix" },
    examples: [
      {
        problem_statement: "Alice can paint a room in 6 hours. Bob can paint it in 3 hours. How long together?",
        solution: [
          { step_num: 1, operation: "Alice's rate: 1/6 room per hour" },
          { step_num: 2, operation: "Bob's rate: 1/3 room per hour" },
          { step_num: 3, operation: "Combined rate: 1/6 + 1/3 = 1/2 room per hour" },
          { step_num: 4, operation: "Time = 1 ÷ (1/2) = 2 hours", result: "2" },
        ],
      },
    ],
    key_reminders: ["Combined rate = sum of individual rates", "Time = Work ÷ Rate"],
    common_mistakes: ["Averaging the times instead of summing rates", "Inverting the fraction"],
  },
  {
    id: "gmat-ds-numbers-1",
    domain: "gmat",
    concept: { technique_name: "Number Properties — DS", category: "data_sufficiency" },
    difficulty: 4,
    expected_time: 120,
    visual_scaffold: { type: "grid_construction" },
    examples: [
      {
        problem_statement: "Is x divisible by 6? (1) x is divisible by 2. (2) x is divisible by 3.",
        solution: [
          { step_num: 1, operation: "For divisibility by 6, need both factors 2 and 3" },
          { step_num: 2, operation: "Statement 1: x is divisible by 2 — tells us x has factor 2" },
          { step_num: 3, operation: "Statement 2: x is divisible by 3 — tells us x has factor 3" },
          { step_num: 4, operation: "Both together: x has factors 2 AND 3 → divisible by 6" },
          { step_num: 5, operation: "Answer: Both statements together are sufficient (C)", result: "C" },
        ],
      },
    ],
    key_reminders: ["Divisibility by 6 requires both 2 and 3", "Data Sufficiency: evaluate individually first, then together"],
    common_mistakes: ["Assuming (1) alone is enough", "Forgetting that 6 = 2 × 3"],
  },
  {
    id: "gmat-sc-parallel-1",
    domain: "gmat",
    concept: { technique_name: "Parallel Structure — SC", category: "sentence_correction" },
    difficulty: 3,
    expected_time: 75,
    visual_scaffold: { type: "equation_chain" },
    examples: [
      {
        problem_statement: "The athlete trained rigorously, ate a balanced diet, and ___ plenty of rest.",
        solution: [
          { step_num: 1, operation: "List: trained, ate, ___  — all verbs in past tense" },
          { step_num: 2, operation: "First two are past tense (trained, ate)" },
          { step_num: 3, operation: "Third must also be past tense: 'got'" },
          { step_num: 4, operation: "Correct: 'got plenty of rest'", result: "got" },
        ],
      },
    ],
    key_reminders: ["Items in a list must share the same grammatical form", "Look for 'and', 'or', 'but' as parallelism markers"],
    common_mistakes: ["Switching from past to present tense mid-list", "Using a gerund when the list starts with base verbs"],
  },
];

export function getTemplatesByDomain(domain: string): SolveAlongTemplate[] {
  return SAMPLE_TEMPLATES.filter((t) => t.domain === domain);
}

export function getTemplatesByCategory(
  category: string,
  domain?: string,
): SolveAlongTemplate[] {
  return SAMPLE_TEMPLATES.filter(
    (t) => t.concept.category === category && (!domain || t.domain === domain),
  );
}

export function getTemplateById(id: string): SolveAlongTemplate | undefined {
  return SAMPLE_TEMPLATES.find((t) => t.id === id);
}

export function getCategoriesForDomain(domain: string): string[] {
  const cats = new Set<string>();
  for (const t of SAMPLE_TEMPLATES) {
    if (t.domain === domain) cats.add(t.concept.category);
  }
  return Array.from(cats);
}

const FALLBACK_SCAFFOLD_TYPES: Array<SolveAlongTemplate["visual_scaffold"]["type"]> = [
  "arrow_matrix",
  "number_line",
  "grid_construction",
  "equation_chain",
  "place_value_chart",
  "shape_canvas",
  "venn_diagram",
];

const FALLBACK_REMINDERS: Record<string, string[]> = {
  vedic_math: [
    "Practice mental calculations daily",
    "Look for patterns before applying formulas",
    "Break complex problems into smaller steps",
    "Verify your answer with approximation",
  ],
  gmat: [
    "Read the question carefully before solving",
    "Eliminate wrong answers first",
    "Manage time — don't spend too long on one question",
    "Look for clue words in the stem",
  ],
  general: [
    "Understand the concept before memorizing steps",
    "Check your work with a different method",
    "Focus on accuracy first, then speed",
    "Review mistakes to identify weak areas",
  ],
};

const FALLBACK_MISTAKES: string[] = [
  "Rushing through the problem without reading carefully",
  "Misapplying the formula or technique",
  "Arithmetic errors in intermediate steps",
  "Forgetting to double-check the final answer",
];

const DOMAIN_LABEL_MAP: Record<string, string> = {
  "vedic-math": "Vedic Math",
  gmat: "GMAT",
  cat: "CAT",
  gre: "GRE",
  banking: "Banking",
};

let _fallbackCounter = 0;

export function generateFallbackTemplates(
  domain: string,
  category: string,
  count = 3,
): SolveAlongTemplate[] {
  const domainLabel = DOMAIN_LABEL_MAP[domain] || domain;
  const catLabel = category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const namePatterns = [
    `Core ${domainLabel} — ${catLabel}`,
    `Advanced ${domainLabel} — ${catLabel}`,
    `Rapid ${domainLabel} — ${catLabel}`,
  ];
  const reminders =
    FALLBACK_REMINDERS[domain as keyof typeof FALLBACK_REMINDERS] ??
    FALLBACK_REMINDERS.general;

  return Array.from({ length: count }, (_, i) => {
    const idx = _fallbackCounter++;
    const scaffoldType =
      FALLBACK_SCAFFOLD_TYPES[
        (i + _fallbackCounter) % FALLBACK_SCAFFOLD_TYPES.length
      ];

    return {
      id: `fallback__${domain}__${category}__${idx}`,
      domain,
      concept: {
        technique_name: namePatterns[i % namePatterns.length],
        category,
      },
      difficulty: (i % 3) + 2, // 2, 3, 4
      expected_time: 30 + i * 15, // 30, 45, 60
      visual_scaffold: { type: scaffoldType },
      examples: [
        {
          problem_statement: `Sample problem for ${domainLabel} — ${catLabel} (Example ${i + 1})`,
          solution: [
            { step_num: 1, operation: "Identify the given values and the target value" },
            { step_num: 2, operation: "Select the appropriate formula or technique" },
            { step_num: 3, operation: "Apply the method step by step" },
            { step_num: 4, operation: "Verify the result for consistency" },
          ],
        },
      ],
      key_reminders: reminders.slice(0, 2),
      common_mistakes: FALLBACK_MISTAKES.slice(0, 2),
    };
  });
}
