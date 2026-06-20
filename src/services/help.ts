import { FAQ_ITEMS } from "@/lib/mock/help";
import type { FaqItem } from "@/lib/types/help";
import { apiGet } from "./api";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK !== "false";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
