export type AnalyticsStats = {
  totalSessions: number;
  avgScore: number;
  bestStreak: number;
  arenaRank: number;
};

export type WeeklyDatum = {
  day: string;
  pct: number;
};

export type RecentActivityItem = {
  title: string;
  sub: string;
  time: string;
};
