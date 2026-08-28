import { REPORT_SUMMARY, REPORT_TOPICS } from "@/lib/mock/reports";
import type { ReportSummary, ReportTopic } from "@/lib/types/reports";
import { apiGet } from "./api";

import { IS_MOCK } from "@/lib/config";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getReportSummary(): Promise<ReportSummary> {
  if (IS_MOCK) { await delay(200); return REPORT_SUMMARY; }
  return apiGet<ReportSummary>("/reports/summary");
}

export async function getReportTopics(): Promise<ReportTopic[]> {
  if (IS_MOCK) { await delay(150); return REPORT_TOPICS; }
  return apiGet<ReportTopic[]>("/reports/topics");
}
