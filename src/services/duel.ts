import { getDuelTopics as mockGetDuelTopics, DUEL_OPPONENTS, generateDuelResult } from "@/lib/mock/duel";
import type { DuelTopic, DuelOpponent, DuelResult } from "@/lib/types/duel";
import { apiGet } from "./api";

import { IS_MOCK } from "@/lib/config";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getDuelTopics(domain?: string): Promise<DuelTopic[]> {
  if (IS_MOCK) {
    await delay(100);
    return mockGetDuelTopics(domain ?? "vedic-math");
  }
  const params = domain ? `?domain=${domain}` : "";
  return apiGet<DuelTopic[]>(`/duel/topics${params}`);
}

export async function getDuelOpponents(): Promise<DuelOpponent[]> {
  if (IS_MOCK) {
    await delay(100);
    return DUEL_OPPONENTS;
  }
  return apiGet<DuelOpponent[]>("/duel/opponents");
}

export async function submitDuelResult(yourCorrect: number, total: number): Promise<DuelResult> {
  if (IS_MOCK) {
    await delay(300);
    return generateDuelResult(yourCorrect, total);
  }
  return apiGet<DuelResult>(`/duel/result?correct=${yourCorrect}&total=${total}`);
}
