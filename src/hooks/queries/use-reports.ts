import { useQuery } from "@tanstack/react-query";
import { getReportSummary, getReportTopics } from "@/services/reports";
import type { ReportSummary, ReportTopic } from "@/lib/types/reports";

type ReportsData = {
  summary: ReportSummary;
  topics: ReportTopic[];
};

async function fetchReportsData(): Promise<ReportsData> {
  const [summary, topics] = await Promise.all([getReportSummary(), getReportTopics()]);
  return { summary, topics };
}

export function useReports() {
  return useQuery<ReportsData>({
    queryKey: ["reports"],
    queryFn: fetchReportsData,
  });
}
