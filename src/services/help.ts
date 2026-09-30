import { FAQ_ITEMS } from "@/lib/mock/help";
import type { FaqItem } from "@/lib/types/help";
import { apiGet } from "./api";
import { delay } from "@/lib/mock/delay";

import { IS_MOCK } from "@/lib/config";

export async function getFaqItems(): Promise<FaqItem[]> {
  if (IS_MOCK) {
    await delay(150);
    return FAQ_ITEMS;
  }
  return apiGet<FaqItem[]>("/help/faq");
}

export async function getAppInfo(): Promise<{ version: string; platform: string; buildNumber: string }> {
  if (IS_MOCK) {
    await delay(100);
    return { version: "1.0.0", platform: "Web / Android APK", buildNumber: "2026.06.20" };
  }
  return apiGet<{ version: string; platform: string; buildNumber: string }>("/help/app-info");
}
