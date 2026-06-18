import { generateSprintSession } from "@/lib/mock/sprint-session";
import type { SprintSession } from "@/lib/types/sprint-session";
import { apiGet } from "./api";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK !== "false";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getSprintQuestions(
  topic: string,
  length: number,
  difficulty: string,
): Promise<SprintSession> {
  if (IS_MOCK) {
    await delay(300);
    return generateSprintSession(topic, length, difficulty);
  }
  return apiGet<SprintSession>(`/sprint/session?topic=${topic}&length=${length}&difficulty=${difficulty}`);
}
