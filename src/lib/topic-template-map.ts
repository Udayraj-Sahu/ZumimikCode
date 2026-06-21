export const TOPIC_TO_CATEGORY: Record<string, Record<string, string[]>> = {
  "vedic-math": {
    multiplication: ["multiplication"],
    division: ["division"],
  },
  gmat: {
    ps: ["problem_solving"],
    ds: ["data_sufficiency"],
    sc: ["sentence_correction"],
  },
};

export function getTemplateCategoriesForTopic(domain: string, topicId: string): string[] {
  return TOPIC_TO_CATEGORY[domain]?.[topicId] ?? ["core"];
}
