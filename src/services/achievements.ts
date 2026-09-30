import { ACHIEVEMENTS } from "@/lib/mock/achievements";
import type { AchievementItem } from "@/lib/types/achievements";
import { apiGet } from "./api";
import { delay } from "@/lib/mock/delay";

import { IS_MOCK } from "@/lib/config";

export async function getAchievements(): Promise<AchievementItem[]> {
  if (IS_MOCK) {
    await delay(200);
    return ACHIEVEMENTS;
  }
  return apiGet<AchievementItem[]>("/achievements");
}
