import { useQuery } from "@tanstack/react-query";
import { getHistory } from "@/services/history";
import type { HistoryEntry } from "@/lib/types/history";

export function useHistory() {
  return useQuery<HistoryEntry[]>({
    queryKey: ["history"],
    queryFn: getHistory,
  });
}
