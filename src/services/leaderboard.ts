import { LEADERBOARD_ENTRIES } from "@/lib/mock/leaderboard";
import type { LeaderboardEntry } from "@/lib/types/dashboard";
import { apiGet } from "./api";
import { delay } from "@/lib/mock/delay";

import { IS_MOCK } from "@/lib/config";

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  if (IS_MOCK) {
    await delay(250);
    return LEADERBOARD_ENTRIES;
  }
  return apiGet<LeaderboardEntry[]>("/leaderboard");
}
