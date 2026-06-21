import type { SolveAlongTemplate } from "@/lib/types/template";

export const SAMPLE_TEMPLATES: SolveAlongTemplate[] = [
  {
    id: "mult-764x38",
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
];

export function getTemplatesByCategory(category: string): SolveAlongTemplate[] {
  return SAMPLE_TEMPLATES.filter((t) => t.concept.category === category);
}

export function getTemplateById(id: string): SolveAlongTemplate | undefined {
  return SAMPLE_TEMPLATES.find((t) => t.id === id);
}
