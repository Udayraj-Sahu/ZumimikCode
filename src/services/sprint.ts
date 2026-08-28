import { getTopicsByDomain, SPRINT_CONFIG } from "@/lib/mock/sprint";
import type { SprintTopic, SprintConfig } from "@/lib/types/sprint";
import { apiGet } from "./api";

import { IS_MOCK } from "@/lib/config";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getSprintTopics(domain?: string): Promise<SprintTopic[]> {
  if (IS_MOCK) {
    await delay(200);
    return getTopicsByDomain(domain ?? "vedic-math");
  }
  const params = domain ? `?domain=${domain}` : "";
  return apiGet<SprintTopic[]>(`/sprint/topics${params}`);
}

export async function getSprintConfig(): Promise<SprintConfig> {
  if (IS_MOCK) {
    await delay(100);
    return SPRINT_CONFIG;
  }
  return apiGet<SprintConfig>("/sprint/config");
}
