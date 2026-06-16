import { TOPIC_MASTERY, RADAR_AXES, METRICS } from "@/lib/mock/dashboard";
import type { Topic, RadarAxis, Metric } from "@/lib/types/dashboard";
import { apiGet } from "./api";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK !== "false";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

export async function getDashboardMetrics(): Promise<Metric[]> {
  if (IS_MOCK) {
    await delay(100);
    return METRICS;
  }
  return apiGet<Metric[]>("/dashboard/metrics");
}
