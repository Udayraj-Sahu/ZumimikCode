import type { Technique } from "@/lib/types/technique";
import { getTechniqueById as mockGetById, getTechniquesBySubject as mockGetBySubject, getAllTechniques as mockGetAll } from "@/lib/mock/techniques";
import { apiGet } from "./api";
import { delay } from "@/lib/mock/delay";

import { IS_MOCK } from "@/lib/config";

export async function getTechnique(id: string): Promise<Technique | null> {
  if (IS_MOCK) {
    await delay(200);
    return mockGetById(id) ?? null;
  }
  return apiGet<Technique>(`/api/techniques/${id}`);
}

export async function getTechniquesBySubject(subjectId: string): Promise<Technique[]> {
  if (IS_MOCK) {
    await delay(250);
    return mockGetBySubject(subjectId);
  }
  return apiGet<Technique[]>(`/api/techniques?subject=${subjectId}`);
}

export async function getAllTechniques(): Promise<Technique[]> {
  if (IS_MOCK) {
    await delay(300);
    return mockGetAll();
  }
  return apiGet<Technique[]>("/api/techniques");
}
