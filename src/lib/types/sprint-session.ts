export type TrustStatus = "sandbox" | "trusted" | "live";

export type Question = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  timeLimit: number;
  difficulty?: number;
  hint?: string;
  explanation?: string;
  techniqueId?: string;
  trustStatus?: TrustStatus;
  sourceId?: string;
  variantGroupId?: string;
};

export type SprintSession = {
  id: string;
  domain?: string;
  topic: string;
  topicLabel: string;
  difficulty: string;
  questions: Question[];
  totalTime: number;
};

export type SprintAnswer = {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  timeSpent: number;
};

export type SprintResult = {
  answers: SprintAnswer[];
  score: number;
  total: number;
  accuracy: number;
  totalTimeSpent: number;
  xpEarned: number;
};
