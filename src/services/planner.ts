import { PLANNER_DAYS, PLANNER_STATS } from "@/lib/mock/planner";
import type { PlannerDay, PlannerStats } from "@/lib/types/planner";
import { apiGet } from "./api";
import { delay } from "@/lib/mock/delay";

import { IS_MOCK } from "@/lib/config";

export async function getPlannerDays(): Promise<PlannerDay[]> {
  if (IS_MOCK) {
    await delay(200);
    return PLANNER_DAYS;
  }
  return apiGet<PlannerDay[]>("/planner/days");
}

export async function getPlannerStats(): Promise<PlannerStats> {
  if (IS_MOCK) {
    await delay(100);
    return PLANNER_STATS;
  }
  return apiGet<PlannerStats>("/planner/stats");
}
