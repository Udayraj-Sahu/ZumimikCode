import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTopicMastery, getRadarAxes, getDashboardMetrics,
  getDashboardStats, getStreakData, getUpcomingEvents,
  getLeaderboard, getHomeRecentActivity,
} from "@/services/dashboard";
import { cacheQueryData } from "@/services/offline/sync";
import type { Topic, RadarAxis, Metric, DashboardStats, StreakData, UpcomingEvent, LeaderboardEntry, HomeRecentActivityItem } from "@/lib/types/dashboard";

type DashboardData = {
  topics: Topic[];
  radarAxes: RadarAxis[];
  metrics: Metric[];
  stats: DashboardStats;
  streak: StreakData;
  upcoming: UpcomingEvent[];
  leaderboard: LeaderboardEntry[];
  recent: HomeRecentActivityItem[];
};

async function fetchDashboardData(): Promise<DashboardData> {
  const [topics, radarAxes, metrics, stats, streak, upcoming, leaderboard, recent] = await Promise.all([
    getTopicMastery(),
    getRadarAxes(),
    getDashboardMetrics(),
    getDashboardStats(),
    getStreakData(),
    getUpcomingEvents(),
    getLeaderboard(),
    getHomeRecentActivity(),
  ]);
  return { topics, radarAxes, metrics, stats, streak, upcoming, leaderboard, recent };
}

export function useDashboardData() {
  const query = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });

  useEffect(() => {
    if (query.data) {
      cacheQueryData("dashboard", query.data);
    }
  }, [query.data]);

  return query;
}
