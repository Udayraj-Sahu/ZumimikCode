import { DUEL_TOPICS, DUEL_OPPONENTS, generateDuelResult } from "@/lib/mock/duel";
import type { DuelTopic, DuelOpponent, DuelResult } from "@/lib/types/duel";
import { apiGet } from "./api";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK !== "false";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getDuelTopics(): Promise<DuelTopic[]> {
  if (IS_MOCK) {
    await delay(100);
    return DUEL_TOPICS;
  }
  return apiGet<DuelTopic[]>("/duel/topics");
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
