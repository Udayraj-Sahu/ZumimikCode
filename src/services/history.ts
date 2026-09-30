import { HISTORY_ENTRIES, getTopicFilters } from "@/lib/mock/history";
import type { HistoryEntry } from "@/lib/types/history";
import { apiGet } from "./api";
import { delay } from "@/lib/mock/delay";

import { IS_MOCK } from "@/lib/config";

export async function getHistory(domain?: string): Promise<HistoryEntry[]> {
  if (IS_MOCK) {
    await delay(200);
    return HISTORY_ENTRIES;
  }
  const params = domain ? `?domain=${domain}` : "";
  return apiGet<HistoryEntry[]>(`/history${params}`);
}

export async function getTopicFilterOptions(domain?: string): Promise<{ id: string; label: string }[]> {
  if (IS_MOCK) {
    await delay(50);
    return getTopicFilters(domain ?? "cat");
  }
  const params = domain ? `?domain=${domain}` : "";
  return apiGet<{ id: string; label: string }[]>(`/history/filters${params}`);
}
