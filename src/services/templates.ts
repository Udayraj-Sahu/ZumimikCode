import type { SolveAlongTemplate, TemplateSession } from "@/lib/types/template";
import { SAMPLE_TEMPLATES } from "@/lib/mock/templates";
import { apiGet, apiPost } from "./api";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK !== "false";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getTemplate(id: string): Promise<SolveAlongTemplate | null> {
  if (IS_MOCK) {
    await delay(200);
    return SAMPLE_TEMPLATES.find((t) => t.id === id) ?? null;
  }
  return apiGet<SolveAlongTemplate>(`/api/templates/${id}`);
}

export async function getTemplatesByCategory(
  category: string,
): Promise<SolveAlongTemplate[]> {
  if (IS_MOCK) {
    await delay(200);
    return SAMPLE_TEMPLATES.filter((t) => t.concept.category === category);
  }
  return apiGet<SolveAlongTemplate[]>(`/api/templates?category=${category}`);
}

export async function getAllTemplates(): Promise<SolveAlongTemplate[]> {
  if (IS_MOCK) {
    await delay(300);
    return SAMPLE_TEMPLATES;
  }
  return apiGet<SolveAlongTemplate[]>("/api/templates");
}

export async function createTemplateSession(
  templateIds: string[],
  mode: "quick" | "solve_along" | "guided" = "solve_along",
): Promise<TemplateSession> {
  if (IS_MOCK) {
    await delay(300);
    const templates = SAMPLE_TEMPLATES.filter((t) => templateIds.includes(t.id));
    return {
      id: `session_${Date.now()}`,
      templates,
      currentIndex: 0,
      stepProgress: Object.fromEntries(
        templates.map((t) => [
          t.id,
          { visibleSteps: 0, completed: false, correct: null, timeSpent: 0 },
        ]),
      ),
      mode,
    };
  }
  return apiPost<TemplateSession>("/api/template-sessions", {
    templateIds,
    mode,
  });
}
