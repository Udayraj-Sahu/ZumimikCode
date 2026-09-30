import { generateSprintSession } from "@/lib/mock/sprint-session";
import type { SprintSession } from "@/lib/types/sprint-session";
import { apiGet } from "./api";
import { delay } from "@/lib/mock/delay";

import { IS_MOCK } from "@/lib/config";

export async function getSprintQuestions(
  topic: string,
  length: number,
  difficulty: string,
  domain?: string,
): Promise<SprintSession> {
  if (IS_MOCK) {
    await delay(300);
    return generateSprintSession(topic, length, difficulty, domain);
  }
  const params = new URLSearchParams({ topic, length: String(length), difficulty });
  if (domain) params.set("domain", domain);
  return apiGet<SprintSession>(`/sprint/session?${params}`);
}
