import { PROFILE_DATA, PROFILE_STATS, ACHIEVEMENTS } from "@/lib/mock/profile";
import type { ProfileData, ProfileStat, Achievement } from "@/lib/types/profile";
import { apiGet } from "./api";
import { delay } from "@/lib/mock/delay";

import { IS_MOCK } from "@/lib/config";

export async function getProfile(): Promise<ProfileData> {
  if (IS_MOCK) {
    await delay(200);
    return PROFILE_DATA;
  }
  return apiGet<ProfileData>("/profile");
}

export async function getProfileStats(): Promise<ProfileStat[]> {
  if (IS_MOCK) {
    await delay(150);
    return PROFILE_STATS;
  }
  return apiGet<ProfileStat[]>("/profile/stats");
}

export async function getAchievements(): Promise<Achievement[]> {
  if (IS_MOCK) {
    await delay(250);
    return ACHIEVEMENTS;
  }
  return apiGet<Achievement[]>("/profile/achievements");
}
