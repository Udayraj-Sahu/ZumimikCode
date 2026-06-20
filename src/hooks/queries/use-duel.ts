import { useQuery } from "@tanstack/react-query";
import { getDuelTopics, getDuelOpponents } from "@/services/duel";
import type { DuelTopic, DuelOpponent } from "@/lib/types/duel";

type DuelSetupData = {
  topics: DuelTopic[];
  opponents: DuelOpponent[];
};

async function fetchDuelSetup(): Promise<DuelSetupData> {
  const [topics, opponents] = await Promise.all([getDuelTopics(), getDuelOpponents()]);
  return { topics, opponents };
}

export function useDuelSetup() {
  return useQuery<DuelSetupData>({
    queryKey: ["duel-setup"],
    queryFn: fetchDuelSetup,
  });
}
