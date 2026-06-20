import type { HistoryEntry } from "@/lib/types/history";

function entry(
  id: string, topic: string, label: string, difficulty: string,
  score: number, total: number, xp: number, time: number, daysAgo: number,
): HistoryEntry {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    id, topic, topicLabel: label, difficulty,
    score, total, accuracy: Math.round((score / total) * 100),
    xpEarned: xp, totalTimeSpent: time,
    completedAt: d.toISOString(),
  };
}

export const HISTORY_ENTRIES: HistoryEntry[] = [
  entry("h1", "mixed", "Mixed Challenge", "Intermediate", 14, 15, 190, 142, 0),
  entry("h2", "multiplication", "Speed Mult.", "Advanced", 10, 15, 150, 98, 1),
  entry("h3", "addition", "Rapid Addition", "Beginner", 20, 20, 250, 186, 1),
  entry("h4", "squares", "Mental Squares", "Advanced", 15, 15, 300, 72, 2),
  entry("h5", "division", "Quick Division", "Intermediate", 10, 12, 150, 110, 2),
  entry("h6", "subtraction", "Fast Subtraction", "Beginner", 15, 15, 250, 134, 3),
  entry("h7", "mixed", "Mixed Challenge", "Advanced", 11, 15, 160, 156, 3),
  entry("h8", "addition", "Rapid Addition", "Intermediate", 18, 20, 230, 165, 4),
  entry("h9", "multiplication", "Speed Mult.", "Beginner", 15, 15, 250, 120, 5),
  entry("h10", "squares", "Mental Squares", "Intermediate", 12, 15, 170, 95, 5),
  entry("h11", "division", "Quick Division", "Advanced", 8, 12, 130, 108, 6),
  entry("h12", "subtraction", "Fast Subtraction", "Intermediate", 13, 15, 180, 142, 7),
  entry("h13", "mixed", "Mixed Challenge", "Beginner", 20, 20, 300, 158, 8),
  entry("h14", "addition", "Rapid Addition", "Advanced", 16, 20, 210, 140, 10),
  entry("h15", "squares", "Mental Squares", "Beginner", 15, 15, 250, 80, 12),
  entry("h16", "multiplication", "Speed Mult.", "Intermediate", 12, 15, 170, 130, 14),
  entry("h17", "division", "Quick Division", "Beginner", 12, 12, 220, 100, 16),
  entry("h18", "subtraction", "Fast Subtraction", "Advanced", 11, 15, 160, 138, 20),
  entry("h19", "mixed", "Mixed Challenge", "Intermediate", 13, 15, 180, 148, 25),
  entry("h20", "addition", "Rapid Addition", "Beginner", 20, 20, 250, 175, 30),
];

export const TOPICS_FILTER = [
  { id: "all", label: "All Topics" },
  { id: "addition", label: "Addition" },
  { id: "subtraction", label: "Subtraction" },
  { id: "multiplication", label: "Multiplication" },
  { id: "division", label: "Division" },
  { id: "squares", label: "Squares" },
  { id: "mixed", label: "Mixed" },
];

export const DIFFICULTY_FILTER = [
  { id: "all", label: "All" },
  { id: "Beginner", label: "Beginner" },
  { id: "Intermediate", label: "Intermediate" },
  { id: "Advanced", label: "Advanced" },
];
