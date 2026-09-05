import type { TechniqueExample } from "@/lib/types/technique";
import type { SolveAlongTemplate } from "@/lib/types/template";

export function exampleToTemplate(
  example: TechniqueExample,
  techniqueName: string,
  level: number,
  index: number,
): SolveAlongTemplate {
  return {
    id: `${techniqueName}-${level}-${index}`.toLowerCase().replace(/\s+/g, "-"),
    domain: "cat",
    concept: {
      technique_name: techniqueName,
      category: "technique",
    },
    difficulty: level,
    expected_time: 60,
    version: 1,
    generationMethod: "converted",
    visual_scaffold: {
      type: "textual_scaffold",
      config: {},
    },
    examples: [
      {
        problem_statement: example.problem,
        solution: example.steps.map((step, j) => ({
          step_num: j + 1,
          operation: step,
        })),
        answer: example.answer,
      },
    ],
  };
}
