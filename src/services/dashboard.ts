import { TOPIC_MASTERY, RADAR_AXES, METRICS, DASHBOARD_STATS, STREAK_DATA, UPCOMING_EVENTS, LEADERBOARD, HOME_RECENT_ACTIVITY } from "@/lib/mock/dashboard";
import type { Topic, RadarAxis, Metric, DashboardStats, StreakData, UpcomingEvent, LeaderboardEntry, HomeRecentActivityItem } from "@/lib/types/dashboard";
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

export async function getDashboardStats(): Promise<DashboardStats> {
  if (IS_MOCK) {
    await delay(120);
    return DASHBOARD_STATS;
  }
  return apiGet<DashboardStats>("/dashboard/stats");
}

export async function getStreakData(): Promise<StreakData> {
  if (IS_MOCK) {
    await delay(80);
    return STREAK_DATA;
  }
  return apiGet<StreakData>("/dashboard/streak");
}

export async function getUpcomingEvents(): Promise<UpcomingEvent[]> {
  if (IS_MOCK) {
    await delay(100);
    return UPCOMING_EVENTS;
  }
  return apiGet<UpcomingEvent[]>("/dashboard/events");
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  if (IS_MOCK) {
    await delay(200);
    return LEADERBOARD;
  }
  return apiGet<LeaderboardEntry[]>("/dashboard/leaderboard");
}

export async function getHomeRecentActivity(): Promise<HomeRecentActivityItem[]> {
  if (IS_MOCK) {
    await delay(90);
    return HOME_RECENT_ACTIVITY;
  }
  return apiGet<HomeRecentActivityItem[]>("/dashboard/recent-activity");
}
