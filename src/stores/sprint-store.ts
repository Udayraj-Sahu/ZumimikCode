import { create } from "zustand";
import type { Question, SprintAnswer, SprintResult } from "@/lib/types/sprint-session";

type AnswerEntry = {
  selectedIndex: number;
  timeSpent: number;
};

type SprintState = {
  status: "idle" | "active" | "completed";
  currentIndex: number;
  answers: Record<string, AnswerEntry>;
  questionStartTime: number | null;
  sessionStartTime: number | null;
  timeLeft: number;
  lastResult: SprintResult | null;
  lastSession: { questions: Question[]; topicLabel: string; difficulty: string } | null;

  initSprint: (totalTime: number) => void;
  answerCurrent: (questionId: string, optionIndex: number) => void;
  nextQuestion: () => void;
  tick: () => void;
  completeSprint: (session?: { questions: Question[]; topicLabel: string; difficulty: string }) => void;
  getResult: (questions: Question[]) => SprintResult;
  reset: () => void;
};

export const useSprintStore = create<SprintState>((set, get) => ({
  status: "idle",
  currentIndex: 0,
  answers: {},
  questionStartTime: null,
  sessionStartTime: null,
  timeLeft: 0,
  lastResult: null,
  lastSession: null,

  initSprint: (totalTime) =>
    set({
      status: "active",
      currentIndex: 0,
      answers: {},
      questionStartTime: Date.now(),
      sessionStartTime: Date.now(),
      timeLeft: totalTime,
    }),

  answerCurrent: (questionId, optionIndex) =>
    set((state) => {
      const now = Date.now();
      const timeSpent = state.questionStartTime ? (now - state.questionStartTime) / 1000 : 0;
      return {
        answers: { ...state.answers, [questionId]: { selectedIndex: optionIndex, timeSpent } },
        questionStartTime: now,
      };
    }),

  nextQuestion: () =>
    set((state) => ({
      currentIndex: state.currentIndex + 1,
    })),

  tick: () =>
    set((state) => {
      if (state.status !== "active" || state.timeLeft <= 0) return state;
      const next = state.timeLeft - 1;
      return { timeLeft: next <= 0 ? 0 : next };
    }),

  completeSprint: (session) => {
    const state = get();
    const questions = session?.questions;
    if (questions && questions.length > 0) {
      const result = state.getResult(questions);
      set({ status: "completed", lastResult: result, lastSession: session });
    } else {
      set({ status: "completed" });
    }
  },

  getResult: (questions) => {
    const state = get();
    const totalTimeSpent = state.sessionStartTime ? (Date.now() - state.sessionStartTime) / 1000 : 0;
    const answerList: SprintAnswer[] = questions.map((q) => {
      const a = state.answers[q.id];
      return {
        questionId: q.id,
        selectedIndex: a?.selectedIndex ?? -1,
        correct: a?.selectedIndex === q.correctIndex,
        timeSpent: a?.timeSpent ?? 0,
      };
    });
    const score = answerList.filter((a) => a.correct).length;
    const accuracy = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const xpEarned = Math.round(score * 10 + (accuracy >= 80 ? 50 : 0) + (accuracy >= 100 ? 100 : 0));

    return { answers: answerList, score, total: questions.length, accuracy, totalTimeSpent, xpEarned };
  },

  reset: () =>
    set({
      status: "idle",
      currentIndex: 0,
      answers: {},
      questionStartTime: null,
      sessionStartTime: null,
      timeLeft: 0,
      lastResult: null,
      lastSession: null,
    }),
}));
