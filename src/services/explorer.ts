import type { TopicNode, TopicEdge } from "@/lib/types/technique";
import {
  getSubjectTree as mockGetTree,
  findNodeById as mockFindNode,
  getAllLeafTechniques as mockGetLeaves,
  getSubjectEdges as mockGetEdges,
  getPrerequisitesForTechnique as mockGetPrereqs,
  isTechniqueUnlocked as mockIsUnlocked,
} from "@/lib/mock/explorer";
import { apiGet } from "./api";

import { IS_MOCK } from "@/lib/config";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getSubjectTree(domain: string): Promise<TopicNode[]> {
  if (IS_MOCK) {
    await delay(250);
    return mockGetTree(domain);
  }
  return apiGet<TopicNode[]>(`/api/subjects/tree?domain=${domain}`);
}

export async function findNodeInTree(domain: string, nodeId: string): Promise<TopicNode | null> {
  if (IS_MOCK) {
    await delay(100);
    const tree = mockGetTree(domain);
    return mockFindNode(tree, nodeId);
  }
  return apiGet<TopicNode | null>(`/api/subjects/tree/${nodeId}?domain=${domain}`);
}

export async function getLeafTechniques(domain: string): Promise<TopicNode[]> {
  if (IS_MOCK) {
    await delay(200);
    const tree = mockGetTree(domain);
    return mockGetLeaves(tree);
  }
  return apiGet<TopicNode[]>(`/api/subjects/techniques?domain=${domain}`);
}

export async function getSubjectEdges(): Promise<TopicEdge[]> {
  if (IS_MOCK) {
    await delay(100);
    return mockGetEdges();
  }
  return apiGet<TopicEdge[]>("/api/subjects/edges");
}

export async function getPrerequisitesForTechnique(
  techniqueId: string,
): Promise<TopicEdge[]> {
  if (IS_MOCK) {
    await delay(50);
    return mockGetPrereqs(techniqueId);
  }
  return apiGet<TopicEdge[]>(`/api/subjects/techniques/${techniqueId}/prerequisites`);
}

export async function checkTechniqueUnlocked(
  techniqueId: string,
  masteredTechniqueIds: string[],
): Promise<boolean> {
  if (IS_MOCK) {
    await delay(50);
    return mockIsUnlocked(techniqueId, masteredTechniqueIds);
  }
  return apiGet<boolean>(
    `/api/subjects/techniques/${techniqueId}/unlocked?mastered=${masteredTechniqueIds.join(",")}`,
  );
}
