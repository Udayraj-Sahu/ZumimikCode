import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTopicMastery, getRadarAxes, getDashboardMetrics } from "@/services/dashboard";
import { cacheQueryData } from "@/services/offline/sync";
import type { Topic, RadarAxis, Metric } from "@/lib/types/dashboard";

type DashboardData = {
  topics: Topic[];
  radarAxes: RadarAxis[];
  metrics: Metric[];
};

async function fetchDashboardData(): Promise<DashboardData> {
  const [topics, radarAxes, metrics] = await Promise.all([
    getTopicMastery(),
    getRadarAxes(),
    getDashboardMetrics(),
  ]);
  return { topics, radarAxes, metrics };
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
