import { USER_PREFERENCES, SUBSCRIPTION } from "@/lib/mock/settings";
import type { UserPreferences, Subscription } from "@/lib/types/settings";
import { apiGet } from "./api";

import { IS_MOCK } from "@/lib/config";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getSettings(): Promise<UserPreferences> {
  if (IS_MOCK) {
    await delay(200);
    return USER_PREFERENCES;
  }
  return apiGet<UserPreferences>("/settings");
}

export async function getSubscription(): Promise<Subscription> {
  if (IS_MOCK) {
    await delay(150);
    return SUBSCRIPTION;
  }
  return apiGet<Subscription>("/settings/subscription");
}
