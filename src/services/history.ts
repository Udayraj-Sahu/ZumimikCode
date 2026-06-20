import { HISTORY_ENTRIES } from "@/lib/mock/history";
import type { HistoryEntry } from "@/lib/types/history";
import { apiGet } from "./api";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK !== "false";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getHistory(): Promise<HistoryEntry[]> {
  if (IS_MOCK) {
    await delay(200);
    return HISTORY_ENTRIES;
  }
  return apiGet<HistoryEntry[]>("/history");
}
