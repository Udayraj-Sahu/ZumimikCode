import { getMockPapersByDomain, getMockPaperById } from "@/lib/mock/mock-exam";
import { buildPaperSession } from "@/lib/mock/sprint-session";
import type { MockPaper } from "@/lib/types/mock-exam";
import type { SprintSession } from "@/lib/types/sprint-session";
import { apiGet } from "./api";

import { IS_MOCK } from "@/lib/config";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getMockPapers(domain?: string): Promise<MockPaper[]> {
  if (IS_MOCK) {
    await delay(250);
    return getMockPapersByDomain(domain);
  }
  const params = new URLSearchParams();
  if (domain) params.set("domain", domain);
  return apiGet<MockPaper[]>(`/mock-exam/papers?${params.toString()}`);
}

export async function getMockPaperSession(paperId: string, domain?: string): Promise<SprintSession> {
  if (IS_MOCK) {
    await delay(200);
    const paper = getMockPaperById(paperId);
    if (!paper) throw new Error("Mock paper not found");
    return buildPaperSession(
      paper.domain ?? domain ?? "cat",
      paper.title,
      paper.durationMinutes,
      paper.sections.map((s) => ({ topic: s.topic, questions: s.questions })),
    );
  }
  const params = new URLSearchParams();
  if (domain) params.set("domain", domain);
  return apiGet<SprintSession>(`/mock-exam/session/${paperId}?${params.toString()}`);
}
