import type { TopicNode } from "@/lib/types/technique";

const SUBJECT_TREES: Record<string, TopicNode[]> = {
  "vedic-math": [
    {
      id: "vedic-math",
      type: "subject",
      title: "Vedic Math",
      slug: "vedic-math",
      description: "Ancient Indian mathematical techniques for fast mental calculation",
      children: [
        {
          id: "multiplication",
          type: "topic",
          title: "Multiplication",
          slug: "multiplication",
          children: [
            {
              id: "nikhilam",
              type: "subtopic",
              title: "Nikhilam Sutra",
              slug: "nikhilam",
              description: "Multiplication using base numbers (powers of 10)",
              children: [
                { id: "nikhilam-base-100", type: "technique", title: "Nikhilam Base 100", slug: "nikhilam-base-100", techniqueId: "nikhilam-base-100" },
                { id: "nikhilam-base-1000", type: "technique", title: "Nikhilam Base 1000", slug: "nikhilam-base-1000", techniqueId: "nikhilam-base-1000" },
              ],
            },
            {
              id: "vert-cross",
              type: "subtopic",
              title: "Vertical & Crosswise",
              slug: "vert-cross",
              description: "Single-line multiplication using crosswise addition",
              children: [
                { id: "vert-cross-2digit", type: "technique", title: "Vert & Crosswise (2-digit)", slug: "vert-cross-2digit", techniqueId: "vert-cross-2digit" },
              ],
            },
          ],
        },
        {
          id: "division",
          type: "topic",
          title: "Division",
          slug: "division",
          children: [
            {
              id: "direct",
              type: "subtopic",
              title: "Direct Division",
              slug: "direct",
              description: "Digit-by-digit division with flag method",
              children: [
                { id: "direct-division", type: "technique", title: "Direct Division", slug: "direct-division", techniqueId: "direct-division" },
              ],
            },
          ],
        },
        {
          id: "squares",
          type: "topic",
          title: "Squares & Roots",
          slug: "squares",
          children: [
            {
              id: "digital-root",
              type: "subtopic",
              title: "Digital Root",
              slug: "digital-root",
              description: "Sum of digits reduced to single digit for verification",
              children: [
                { id: "digital-root-check", type: "technique", title: "Digital Root Check", slug: "digital-root-check", techniqueId: "digital-root" },
              ],
            },
          ],
        },
      ],
    },
  ],
  "fundamental-math": [
    {
      id: "fundamental-math",
      type: "subject",
      title: "Fundamental Math",
      slug: "fundamental-math",
      description: "Core mathematics concepts for competitive exams",
      children: [
        {
          id: "number-system",
          type: "topic",
          title: "Number System",
          slug: "number-system",
          children: [
            {
              id: "factors",
              type: "subtopic",
              title: "Factors & Multiples",
              slug: "factors",
              children: [
                { id: "number-system-factors", type: "technique", title: "Factor Counting & Sum", slug: "number-system-factors", techniqueId: "number-system-factors" },
                { id: "prime-factorization", type: "technique", title: "Prime Factorization", slug: "prime-factorization", techniqueId: "prime-factorization" },
                { id: "lcm-gcd", type: "technique", title: "LCM & GCD", slug: "lcm-gcd", techniqueId: "lcm-gcd" },
              ],
            },
          ],
        },
      ],
    },
  ],
  gmat: [
    {
      id: "gmat",
      type: "subject",
      title: "GMAT",
      slug: "gmat",
      description: "Graduate Management Admission Test preparation",
      children: [
        {
          id: "quantitative",
          type: "topic",
          title: "Quantitative",
          slug: "quantitative",
          children: [
            {
              id: "work-rate",
              type: "subtopic",
              title: "Work Rate",
              slug: "work-rate",
              children: [
                { id: "work-rate-tech", type: "technique", title: "Work Rate Problems", slug: "work-rate-tech", techniqueId: "work-rate" },
              ],
            },
            {
              id: "speed-distance",
              type: "subtopic",
              title: "Speed & Distance",
              slug: "speed-distance",
              children: [
                { id: "speed-distance-tech", type: "technique", title: "Speed & Distance", slug: "speed-distance-tech", techniqueId: "speed-distance" },
              ],
            },
          ],
        },
        {
          id: "ds",
          type: "topic",
          title: "Data Sufficiency",
          slug: "data-sufficiency",
          children: [
            {
              id: "ds-strategy",
              type: "subtopic",
              title: "Strategy & Grid Method",
              slug: "ds-strategy",
              children: [
                { id: "ds-strategy-tech", type: "technique", title: "DS Strategy", slug: "ds-strategy-tech", techniqueId: "data-sufficiency" },
              ],
            },
          ],
        },
        {
          id: "sc",
          type: "topic",
          title: "Sentence Correction",
          slug: "sentence-correction",
          children: [
            {
              id: "parallelism",
              type: "subtopic",
              title: "Parallelism",
              slug: "parallelism",
              children: [
                { id: "sc-parallelism", type: "technique", title: "Parallel Structure", slug: "sc-parallelism", techniqueId: "sentence-correction-parallelism" },
              ],
            },
          ],
        },
      ],
    },
  ],
  gre: [
    {
      id: "gre",
      type: "subject",
      title: "GRE",
      slug: "gre",
      description: "Graduate Record Examination preparation",
      children: [
        {
          id: "quantitative",
          type: "topic",
          title: "Quantitative Reasoning",
          slug: "quantitative",
          children: [
            {
              id: "quant-comparison",
              type: "subtopic",
              title: "Quant Comparison",
              slug: "quant-comparison",
              children: [
                { id: "quant-comparison-tech", type: "technique", title: "QC Strategy", slug: "quant-comparison-tech", techniqueId: "quant-comparison" },
              ],
            },
          ],
        },
      ],
    },
  ],
  banking: [
    {
      id: "banking",
      type: "subject",
      title: "Banking Exams",
      slug: "banking",
      description: "Banking competitive exam preparation",
      children: [
        {
          id: "numerical",
          type: "topic",
          title: "Numerical Ability",
          slug: "numerical",
          children: [
            {
              id: "percentages",
              type: "subtopic",
              title: "Percentages",
              slug: "percentages",
              children: [
                { id: "percentage-tricks-tech", type: "technique", title: "Percentage Tricks", slug: "percentage-tricks-tech", techniqueId: "percentage-tricks" },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export function getSubjectTree(domain: string): TopicNode[] {
  const tree = SUBJECT_TREES[domain] ?? [];
  if (tree.length > 0) return tree;
  if (domain === "cat") return SUBJECT_TREES["gmat"] ?? [];
  return [];
}

export function findNodeById(tree: TopicNode[], id: string): TopicNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function getAllLeafTechniques(tree: TopicNode[]): TopicNode[] {
  const leaves: TopicNode[] = [];
  function walk(nodes: TopicNode[]) {
    for (const node of nodes) {
      if (node.type === "technique" && node.techniqueId) {
        leaves.push(node);
      }
      if (node.children) walk(node.children);
    }
  }
  walk(tree);
  return leaves;
}
