import type { DuelTopic, DuelOpponent, DuelResult } from "@/lib/types/duel";

export const DUEL_TOPICS: DuelTopic[] = [
  { id: "addition", label: "Rapid Addition" },
  { id: "subtraction", label: "Fast Subtraction" },
  { id: "multiplication", label: "Speed Mult." },
  { id: "division", label: "Quick Division" },
  { id: "squares", label: "Mental Squares" },
  { id: "mixed", label: "Mixed Challenge" },
];

export const DUEL_OPPONENTS: DuelOpponent[] = [
  { name: "Priya S.", initials: "PS", level: "Gold" },
  { name: "Arjun M.", initials: "AM", level: "Silver" },
  { name: "Rohan K.", initials: "RK", level: "Gold" },
  { name: "Neha V.", initials: "NV", level: "Bronze" },
  { name: "Vikram P.", initials: "VP", level: "Silver" },
];

export function generateDuelResult(yourCorrect: number, total: number): DuelResult {
  const opponentCorrect = Math.max(0, Math.min(total, yourCorrect + Math.floor(Math.random() * 5) - 2));
  return {
    yourScore: yourCorrect,
    opponentScore: opponentCorrect,
    yourAccuracy: Math.round((yourCorrect / total) * 100),
    opponentAccuracy: Math.round((opponentCorrect / total) * 100),
    yourTime: Math.round(30 + Math.random() * 60),
    opponentTime: Math.round(20 + Math.random() * 70),
    won: yourCorrect > opponentCorrect,
    xpEarned: yourCorrect * 15 + (yourCorrect > opponentCorrect ? 100 : 25),
  };
}
