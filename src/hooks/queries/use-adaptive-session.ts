import { useMemo } from "react";
import { useSprintSession } from "./use-sprint-session";
import type { TrustStatus } from "@/lib/types/sprint-session";

const TRUST_PRIORITY: Record<TrustStatus, number> = {
  trusted: 0,
  sandbox: 1,
  live: 2,
};

type AdaptiveOptions = {
  topic: string;
  length: number;
  difficulty: string;
  domain?: string;
  techniqueId?: string;
  preferTrusted?: boolean;
};

export function useAdaptiveSession(options: AdaptiveOptions) {
  const { topic, length, difficulty, domain, techniqueId, preferTrusted = true } = options;

  const query = useSprintSession(topic, length, difficulty, domain);

  const orderedQuestions = useMemo(() => {
    const questions = query.data?.questions;
    if (!questions) return undefined;

    let filtered = questions;

    if (techniqueId) {
      filtered = filtered.filter((q) => q.techniqueId === techniqueId || !q.techniqueId);
    }

    if (preferTrusted) {
      filtered = [...filtered].sort((a, b) => {
        const pa = a.trustStatus ? TRUST_PRIORITY[a.trustStatus] ?? 2 : 1;
        const pb = b.trustStatus ? TRUST_PRIORITY[b.trustStatus] ?? 2 : 1;
        return pa - pb;
      });
    }

    return filtered;
  }, [query.data, techniqueId, preferTrusted]);

  return {
    ...query,
    data: query.data
      ? { ...query.data, questions: orderedQuestions ?? query.data.questions }
      : undefined,
  };
}
