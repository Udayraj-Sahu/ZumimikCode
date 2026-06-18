export type Question = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  timeLimit: number;
};

export type SprintSession = {
  id: string;
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
