import { useAdaptiveStore } from "@/stores/adaptive-store";
import type { AdaptiveDomainState, SessionOutcome } from "@/lib/types/adaptive";
import { apiGet, apiPost } from "./api";
import { delay } from "@/lib/mock/delay";

import { IS_MOCK } from "@/lib/config";

export async function getAdaptiveState(domain: string): Promise<AdaptiveDomainState> {
  if (IS_MOCK) {
    await delay(120);
    return useAdaptiveStore.getState().ensureState(domain);
  }
  return apiGet<AdaptiveDomainState>(`/adaptive/state?domain=${domain}`);
}

export async function recordAdaptiveSession(outcome: SessionOutcome): Promise<AdaptiveDomainState> {
  if (IS_MOCK) {
    await delay(80);
    return useAdaptiveStore.getState().recordSession(outcome);
  }
  return apiPost<AdaptiveDomainState>("/adaptive/sessions", outcome);
}