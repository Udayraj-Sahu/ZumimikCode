import type { AchievementItem } from "@/lib/types/achievements";

export const ACHIEVEMENTS: AchievementItem[] = [
  { id: "streak-7", icon: "Flame", label: "Streak Champion", description: "7-day streak", unlocked: true },
  { id: "streak-30", icon: "Flame", label: "Iron Will", description: "30-day streak", unlocked: false, progress: 52 },
  { id: "accuracy-90", icon: "Target", label: "Accuracy Master", description: "90%+ accuracy in a sprint", unlocked: true },
  { id: "accuracy-100", icon: "Target", label: "Perfect Round", description: "100% accuracy in a sprint", unlocked: false, progress: 0 },
  { id: "speed-demon", icon: "Zap", label: "Speed Demon", description: "<5s avg response time", unlocked: true },
  { id: "sprint-50", icon: "Swords", label: "Veteran", description: "50 sprints completed", unlocked: false, progress: 34 },
  { id: "sprint-100", icon: "Swords", label: "Warrior", description: "100 sprints completed", unlocked: false, progress: 12 },
  { id: "top-10", icon: "Medal", label: "Top 10", description: "Reach top 10 on leaderboard", unlocked: false, progress: 0 },
  { id: "top-50", icon: "Trophy", label: "Arena Star", description: "Reach top 50 on leaderboard", unlocked: true },
  { id: "variety", icon: "LayoutGrid", label: "All-Rounder", description: "Complete sprints in all topics", unlocked: false, progress: 60 },
  { id: "speed-10", icon: "Timer", label: "Lightning", description: "10 sprints under 5 min", unlocked: false, progress: 40 },
  { id: "social", icon: "Users", label: "Team Player", description: "Complete a group challenge", unlocked: false, progress: 0 },
];
