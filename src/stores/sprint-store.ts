import { create } from "zustand";
import type { Question, SprintAnswer, SprintResult } from "@/lib/types/sprint-session";

export type AnswerEntry = {
  selectedIndex: number;
  timeSpent: number;
};

export type SprintSessionMeta = { questions: Question[]; topic: string; topicLabel: string; difficulty: string };

export type ResumePoint = {
  currentIndex: number;
  answers: Record<string, AnswerEntry>;
  questionStartTime: number | null;
  sessionStartTime: number;
  timeLeft: number;
};

type SprintState = {
  status: "idle" | "active" | "completed";
  currentIndex: number;
  answers: Record<string, AnswerEntry>;
  questionStartTime: number | null;
  sessionStartTime: number | null;
  timeLeft: number;
  lastResult: SprintResult | null;
  lastSession: SprintSessionMeta | null;

  initSprint: (totalTime: number) => void;
  resumeSprint: (point: ResumePoint) => void;
  answerCurrent: (questionId: string, optionIndex: number) => void;
  nextQuestion: () => void;
  tick: () => void;
  jumpTo: (index: number) => void;
  completeSprint: (session?: SprintSessionMeta) => void;
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
      lastResult: null,
      lastSession: null,
    }),

  resumeSprint: (point) =>
    set({
      status: "active",
      currentIndex: point.currentIndex,
      answers: point.answers,
      questionStartTime: point.questionStartTime ?? Date.now(),
      sessionStartTime: point.sessionStartTime,
      timeLeft: point.timeLeft,
      lastResult: null,
      lastSession: null,
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

  jumpTo: (index) =>
    set((state) => ({
      currentIndex: Math.max(0, index),
      questionStartTime: Date.now(),
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
    }),
}));
