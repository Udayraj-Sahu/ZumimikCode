import { ACHIEVEMENTS } from "@/lib/mock/achievements";
import type { AchievementItem } from "@/lib/types/achievements";
import { apiGet } from "./api";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK !== "false";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getAchievements(): Promise<AchievementItem[]> {
  if (IS_MOCK) {
    await delay(200);
    return ACHIEVEMENTS;
  }
  return apiGet<AchievementItem[]>("/achievements");
}
