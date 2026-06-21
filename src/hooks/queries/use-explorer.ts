import { useQuery } from "@tanstack/react-query";
import { getSubjectTree, getLeafTechniques } from "@/services/explorer";
import { useOnboardingStore } from "@/stores/onboarding-store";
import type { TopicNode } from "@/lib/types/technique";

export function useSubjectTree() {
  const targetExam = useOnboardingStore((s) => s.targetExam);
  return useQuery<TopicNode[]>({
    queryKey: ["subject-tree", targetExam],
    queryFn: () => getSubjectTree(targetExam || "vedic-math"),
    enabled: !!targetExam,
  });
}

export function useLeafTechniques() {
  const targetExam = useOnboardingStore((s) => s.targetExam);
  return useQuery<TopicNode[]>({
    queryKey: ["leaf-techniques", targetExam],
    queryFn: () => getLeafTechniques(targetExam || "vedic-math"),
    enabled: !!targetExam,
  });
}
