import { PLANNER_DAYS, PLANNER_STATS } from "@/lib/mock/planner";
import type { PlannerDay, PlannerStats } from "@/lib/types/planner";
import { apiGet } from "./api";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK !== "false";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
