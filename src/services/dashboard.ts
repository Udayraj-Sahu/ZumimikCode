import { STATS, TOPIC_MASTERY, RADAR_AXES } from "@/lib/mock/dashboard";
import type { Stat, Topic, RadarAxis } from "@/lib/types/dashboard";
import { apiGet } from "./api";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK !== "false";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getDashboardStats(): Promise<Stat[]> {
  if (IS_MOCK) {
    await delay(200);
    return STATS;
  }
  return apiGet<Stat[]>("/dashboard/stats");
}

export async function getTopicMastery(): Promise<Topic[]> {
  if (IS_MOCK) {
    await delay(250);
    return TOPIC_MASTERY;
  }
  return apiGet<Topic[]>("/dashboard/topics");
}

export async function getRadarAxes(): Promise<RadarAxis[]> {
  if (IS_MOCK) {
    await delay(150);
    return RADAR_AXES;
  }
  return apiGet<RadarAxis[]>("/dashboard/radar");
}
