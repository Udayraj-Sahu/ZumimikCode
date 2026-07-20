import type { SolveAlongTemplate } from "@/lib/types/template";

export const SAMPLE_TEMPLATES: SolveAlongTemplate[] = [
  // ── VEDIC MATH ──────────────────────────────────────────
  {
    id: "mult-764x38",
    domain: "vedic-math",
    concept: { technique_name: "Nikhilam Multiplication", category: "multiplication" },
    difficulty: 3,
    expected_time: 45,
    version: 1,
    generationMethod: "template",
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
    version: 1,
    generationMethod: "template",
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
    version: 1,
    generationMethod: "template",
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
    version: 1,
    generationMethod: "template",
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
    version: 1,
    generationMethod: "template",
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
    version: 1,
    generationMethod: "template",
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

  // ── VEDIC MATH: ADDITION ──────────────────────────────
  {
    id: "add-142-387",
    domain: "vedic-math",
    concept: { technique_name: "Left-to-Right Addition", category: "addition" },
    difficulty: 2,
    expected_time: 20,
    visual_scaffold: { type: "place_value_chart" },
    examples: [
      {
        problem_statement: "Add 142 + 387 using left-to-right method",
        solution: [
          { step_num: 1, operation: "Add hundreds: 100 + 300 = 400" },
          { step_num: 2, operation: "Add tens: 40 + 80 = 120" },
          { step_num: 3, operation: "Add ones: 2 + 7 = 9" },
          { step_num: 4, operation: "Combine: 400 + 120 + 9 = 529", result: "529" },
        ],
      },
    ],
    key_reminders: ["Add from left to right (largest place first)", "Keep a running total in your head"],
    common_mistakes: ["Adding from right to left like standard method", "Losing track of carries when adding left to right"],
  },
  {
    id: "add-574-298",
    domain: "vedic-math",
    concept: { technique_name: "Complementary Addition", category: "addition" },
    difficulty: 2,
    expected_time: 20,
    visual_scaffold: { type: "number_line" },
    examples: [
      {
        problem_statement: "Add 574 + 298 using complementary method",
        solution: [
          { step_num: 1, operation: "Round 298 up to 300: 574 + 300 = 874" },
          { step_num: 2, operation: "We added 2 extra, so subtract 2: 874 — 2 = 872" },
          { step_num: 3, operation: "Answer: 872", result: "872" },
        ],
      },
    ],
    key_reminders: ["Round one number to the nearest hundred, then adjust", "If you round up, subtract the excess at the end"],
    common_mistakes: ["Forgetting to subtract the rounding adjustment", "Rounding the wrong direction"],
  },
  {
    id: "add-3456-789",
    domain: "vedic-math",
    concept: { technique_name: "Column Addition — Rapid", category: "addition" },
    difficulty: 3,
    expected_time: 25,
    visual_scaffold: { type: "place_value_chart" },
    examples: [
      {
        problem_statement: "Add 3,456 + 789",
        solution: [
          { step_num: 1, operation: "Align by place value: thousands, hundreds, tens, ones" },
          { step_num: 2, operation: "Thousands: 3 + 0 = 3" },
          { step_num: 3, operation: "Hundreds: 4 + 7 = 11 → carry 1 thousand, write 1 hundred" },
          { step_num: 4, operation: "Tens: 5 + 8 = 13 + carry 0 = 13 → carry 1 hundred, write 3 tens" },
          { step_num: 5, operation: "Ones: 6 + 9 = 15 + carry 0 = 15 → write 5, carry 1 ten" },
          { step_num: 6, operation: "Answer: 4,245", result: "4245" },
        ],
      },
    ],
    key_reminders: ["Align numbers by place value", "Carry over when a column sum exceeds 9"],
    common_mistakes: ["Misaligning digits with different place values", "Forgetting to add the carry to the next column"],
  },

  // ── VEDIC MATH: SUBTRACTION ───────────────────────────
  {
    id: "sub-500-237",
    domain: "vedic-math",
    concept: { technique_name: "Complementary Subtraction", category: "subtraction" },
    difficulty: 2,
    expected_time: 20,
    visual_scaffold: { type: "number_line" },
    examples: [
      {
        problem_statement: "Subtract 237 from 500",
        solution: [
          { step_num: 1, operation: "Think: what number plus 237 equals 500?" },
          { step_num: 2, operation: "237 + 263 = 500, because 237 + 200 = 437, 437 + 60 = 497, 497 + 3 = 500" },
          { step_num: 3, operation: "Answer: 263", result: "263" },
        ],
      },
    ],
    key_reminders: ["Use complements for round-number subtractions", "Work with one place value at a time"],
    common_mistakes: ["Borrowing incorrectly across zeros", "Forgetting to adjust after borrowing"],
  },
  {
    id: "sub-1000-456",
    domain: "vedic-math",
    concept: { technique_name: "All-from-9 Last-from-10", category: "subtraction" },
    difficulty: 2,
    expected_time: 15,
    visual_scaffold: { type: "place_value_chart" },
    examples: [
      {
        problem_statement: "Subtract 456 from 1,000",
        solution: [
          { step_num: 1, operation: "For each digit, subtract from 9; for the last digit, subtract from 10" },
          { step_num: 2, operation: "Hundreds: 9 — 4 = 5" },
          { step_num: 3, operation: "Tens: 9 — 5 = 4" },
          { step_num: 4, operation: "Ones: 10 — 6 = 4" },
          { step_num: 5, operation: "Answer: 544", result: "544" },
        ],
      },
    ],
    key_reminders: ["All digits except the last: subtract from 9", "Last digit: subtract from 10"],
    common_mistakes: ["Using 10 for every digit instead of only the last", "Applying this method only to 10, 100, 1000 etc."],
  },
  {
    id: "sub-1234-567",
    domain: "vedic-math",
    concept: { technique_name: "Left-to-Right Subtraction", category: "subtraction" },
    difficulty: 3,
    expected_time: 25,
    visual_scaffold: { type: "place_value_chart" },
    examples: [
      {
        problem_statement: "Subtract 567 from 1,234",
        solution: [
          { step_num: 1, operation: "Subtract hundreds: 1200 — 500 = 700" },
          { step_num: 2, operation: "Subtract tens: 30 — 60 → borrow from 700: (700 — 100) + (130 — 60) = 600 + 70 = 670" },
          { step_num: 3, operation: "Subtract ones: 4 — 7 → borrow from 670: (670 — 10) + (14 — 7) = 660 + 7 = 667" },
          { step_num: 4, operation: "Answer: 667", result: "667" },
        ],
      },
    ],
    key_reminders: ["Subtract left to right, borrowing when needed", "Keep track of borrows mentally"],
    common_mistakes: ["Forgetting to reduce the borrowed digit", "Subtracting the smaller from the larger instead of borrowing"],
  },

  // ── VEDIC MATH: SQUARES ──────────────────────────────
  {
    id: "sq-25",
    domain: "vedic-math",
    concept: { technique_name: "Squaring Numbers Ending in 5", category: "squares" },
    difficulty: 1,
    expected_time: 10,
    visual_scaffold: { type: "arrow_matrix" },
    examples: [
      {
        problem_statement: "Find 25²",
        solution: [
          { step_num: 1, operation: "For numbers ending in 5: multiply the tens digit by (tens digit + 1)" },
          { step_num: 2, operation: "Tens digit: 2 → 2 × (2 + 1) = 2 × 3 = 6" },
          { step_num: 3, operation: "Then append 25" },
          { step_num: 4, operation: "Answer: 625", result: "625" },
        ],
      },
    ],
    key_reminders: ["Only works for numbers ending in 5", "Left part = tens digit × (tens digit + 1)", "Right part is always 25"],
    common_mistakes: ["Applying the rule to numbers not ending in 5", "Forgetting to append 25 at the end"],
  },
  {
    id: "sq-12",
    domain: "vedic-math",
    concept: { technique_name: "Duplex Method for Squares", category: "squares" },
    difficulty: 2,
    expected_time: 15,
    visual_scaffold: { type: "grid_construction" },
    examples: [
      {
        problem_statement: "Find 12²",
        solution: [
          { step_num: 1, operation: "12² = (12 + 2) × (12 — 2) + 2²" },
          { step_num: 2, operation: "= 14 × 10 + 4" },
          { step_num: 3, operation: "= 140 + 4 = 144", result: "144" },
        ],
      },
    ],
    key_reminders: ["Use (a + b)(a — b) + b² identity", "Choose b to make one factor a round number"],
    common_mistakes: ["Miscalculating the difference term", "Forgetting to add b² at the end"],
  },
  {
    id: "sq-13",
    domain: "vedic-math",
    concept: { technique_name: "Base Method for Squares", category: "squares" },
    difficulty: 2,
    expected_time: 15,
    visual_scaffold: { type: "grid_construction" },
    examples: [
      {
        problem_statement: "Find 13²",
        solution: [
          { step_num: 1, operation: "Take nearest base: 10. Deviation from base: +3" },
          { step_num: 2, operation: "Left part: 13 + 3 = 16" },
          { step_num: 3, operation: "Right part: 3² = 9" },
          { step_num: 4, operation: "Since base has 1 zero, right part needs 1 digit: 09" },
          { step_num: 5, operation: "Answer: 169", result: "169" },
        ],
      },
    ],
    key_reminders: ["Left = number + deviation", "Right = deviation² with enough digits (base's zero count)", "Base can be 10, 100, 1000 etc."],
    common_mistakes: ["Not padding the right part to match base's zero count", "Using the wrong sign for the deviation"],
  },

  // ── VEDIC MATH: MIXED ────────────────────────────────
  {
    id: "mix-12x5-plus-20",
    domain: "vedic-math",
    concept: { technique_name: "Order of Operations", category: "mixed" },
    difficulty: 2,
    expected_time: 20,
    visual_scaffold: { type: "equation_chain" },
    examples: [
      {
        problem_statement: "Solve (12 × 5) + 20",
        solution: [
          { step_num: 1, operation: "First complete the bracketed multiplication: 12 × 5 = 60" },
          { step_num: 2, operation: "Then add: 60 + 20 = 80", result: "80" },
        ],
      },
    ],
    key_reminders: ["Always solve brackets first", "Multiplication/division before addition/subtraction"],
    common_mistakes: ["Adding before multiplying", "Ignoring the bracket order"],
  },
  {
    id: "mix-100-minus-7x7",
    domain: "vedic-math",
    concept: { technique_name: "Mixed Operations Strategy", category: "mixed" },
    difficulty: 2,
    expected_time: 20,
    visual_scaffold: { type: "equation_chain" },
    examples: [
      {
        problem_statement: "Solve 100 — (7 × 7)",
        solution: [
          { step_num: 1, operation: "First compute the bracketed multiplication: 7 × 7 = 49" },
          { step_num: 2, operation: "Then subtract: 100 — 49 = 51", result: "51" },
        ],
      },
    ],
    key_reminders: ["Brackets have the highest priority", "Break complex expressions into simple steps"],
    common_mistakes: ["Subtracting before multiplying when there are no brackets", "Misreading the operation order"],
  },

  // ── GMAT ────────────────────────────────────────────────
  {
    id: "gmat-ps-speed-1",
    domain: "gmat",
    concept: { technique_name: "Speed & Distance", category: "problem_solving" },
    difficulty: 3,
    expected_time: 90,
    version: 1,
    generationMethod: "template",
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
    version: 1,
    generationMethod: "template",
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
    version: 1,
    generationMethod: "template",
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
    version: 1,
    generationMethod: "template",
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
      version: 1,
      generationMethod: "llm",
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
