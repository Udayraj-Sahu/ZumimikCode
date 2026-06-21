import { getFlashcards, getTopicsForDomain } from "@/lib/mock/flashcards";
import type { Flashcard } from "@/lib/mock/flashcards";
import { apiGet } from "./api";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK !== "false";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchFlashcards(domain: string, topic: string): Promise<Flashcard[]> {
  if (IS_MOCK) {
    await delay(150);
    return getFlashcards(domain, topic);
  }
  return apiGet<Flashcard[]>(`/flashcards?domain=${domain}&topic=${topic}`);
}

export async function fetchFlashcardTopics(domain: string): Promise<string[]> {
  if (IS_MOCK) {
    await delay(100);
    return getTopicsForDomain(domain);
  }
  return apiGet<string[]>(`/flashcards/topics?domain=${domain}`);
}
