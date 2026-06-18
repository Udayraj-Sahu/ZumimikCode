import { SPRINT_TOPICS, SPRINT_CONFIG } from "@/lib/mock/sprint";
import type { SprintTopic, SprintConfig } from "@/lib/types/sprint";
import { apiGet } from "./api";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK !== "false";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getSprintTopics(): Promise<SprintTopic[]> {
  if (IS_MOCK) {
    await delay(200);
    return SPRINT_TOPICS;
  }
  return apiGet<SprintTopic[]>("/sprint/topics");
}

export async function getSprintConfig(): Promise<SprintConfig> {
  if (IS_MOCK) {
    await delay(100);
    return SPRINT_CONFIG;
  }
  return apiGet<SprintConfig>("/sprint/config");
}
