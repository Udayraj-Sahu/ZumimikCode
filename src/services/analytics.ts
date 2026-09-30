import { ANALYTICS_STATS, WEEKLY_DATA, RECENT_ACTIVITY } from "@/lib/mock/analytics";
import type { AnalyticsStats, WeeklyDatum, RecentActivityItem } from "@/lib/types/analytics";
import { apiGet } from "./api";
import { delay } from "@/lib/mock/delay";

import { IS_MOCK } from "@/lib/config";

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  if (IS_MOCK) {
    await delay(200);
    return ANALYTICS_STATS;
  }
  return apiGet<AnalyticsStats>("/analytics/stats");
}

export async function getWeeklyActivity(): Promise<WeeklyDatum[]> {
  if (IS_MOCK) {
    await delay(150);
    return WEEKLY_DATA;
  }
  return apiGet<WeeklyDatum[]>("/analytics/weekly");
}

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  if (IS_MOCK) {
    await delay(100);
    return RECENT_ACTIVITY;
  }
  return apiGet<RecentActivityItem[]>("/analytics/recent");
}
