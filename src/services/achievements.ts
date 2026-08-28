import { ACHIEVEMENTS } from "@/lib/mock/achievements";
import type { AchievementItem } from "@/lib/types/achievements";
import { apiGet } from "./api";

import { IS_MOCK } from "@/lib/config";

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
