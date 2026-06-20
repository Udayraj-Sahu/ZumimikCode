import { LEADERBOARD_ENTRIES } from "@/lib/mock/leaderboard";
import type { LeaderboardEntry } from "@/lib/types/dashboard";
import { apiGet } from "./api";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK !== "false";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  if (IS_MOCK) {
    await delay(250);
    return LEADERBOARD_ENTRIES;
  }
  return apiGet<LeaderboardEntry[]>("/leaderboard");
}
