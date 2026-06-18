import { useQuery } from "@tanstack/react-query";
import { getSprintTopics, getSprintConfig } from "@/services/sprint";
import type { SprintTopic, SprintConfig } from "@/lib/types/sprint";

type SprintData = {
  topics: SprintTopic[];
  config: SprintConfig;
};

async function fetchSprintData(): Promise<SprintData> {
  const [topics, config] = await Promise.all([
    getSprintTopics(),
    getSprintConfig(),
  ]);
  return { topics, config };
}

export function useSprintTopics() {
  return useQuery<SprintData>({
    queryKey: ["sprint"],
    queryFn: fetchSprintData,
  });
}
