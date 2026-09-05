export type Flashcard = { front: string; back: string };

export const FLASHCARDS_BY_DOMAIN: Record<string, Record<string, Flashcard[]>> = {
  gmat: {
    ps: [
      { front: "15% of 200", back: "30" },
      { front: "3x + 7 = 22, x?", back: "5" },
      { front: "Average of 12, 18, 24, 30", back: "21" },
      { front: "2^5", back: "32" },
      { front: "Area of rectangle 12×5", back: "60" },
    ],
    ds: [
      { front: "Is x > 5? (1) x > 3 (2) x < 8", back: "Both together" },
      { front: "Is n even? (1) n ÷ 4 (2) n+1 odd", back: "Either alone" },
    ],
    sc: [
      { front: "Each of the students ___ required", back: "is" },
      { front: "Neither X nor Y ___", back: "were (plural for latter)" },
      { front: "She is taller than ___", back: "I (subjective)" },
    ],
    cr: [
      { front: "All roses are flowers. Some flowers fade. ∴", back: "Some roses may fade" },
      { front: "Correlation vs causation flaw", back: "Assuming one causes the other" },
    ],
    rc: [
      { front: "Main idea of Industrial Revolution passage", back: "Widespread transformative impact" },
      { front: "Purpose of renewable energy passage", back: "To advocate for renewables" },
    ],
  },
  cat: {
    qa: [
      { front: "LCM of 12, 18, 24", back: "72" },
      { front: "Sum of first 10 natural numbers", back: "55" },
      { front: "A does job in 10d, B in 15d, together?", back: "6 days" },
      { front: "log₂x = 5, x = ?", back: "32" },
    ],
    lrdi: [
      { front: "CAT is coded as 3120, DOG is?", back: "4157" },
      { front: "Pie chart: 40% Science, 500 total, how many Arts (30%)?", back: "150" },
    ],
    va: [
      { front: "Synonym of 'Benevolent'", back: "Kind" },
      { front: "Antonym of 'Abundant'", back: "Scarce" },
      { front: "Correct spelling", back: "Accommodate" },
    ],
  },
  gre: {
    qc: [
      { front: "Compare: 2/3 of 90 vs 60", back: "Equal" },
      { front: "Compare: x² (x=-3) vs 9", back: "Equal" },
      { front: "Compare: 0.25 vs 1/4", back: "Equal" },
    ],
    ps: [
      { front: "0.2 × 0.3", back: "0.06" },
      { front: "Circle area, r=7, π=22/7", back: "154" },
      { front: "Degrees in a right angle", back: "90" },
    ],
    tc: [
      { front: "Despite his ___ nature, he was generous", back: "stingy" },
      { front: "Lecture was ___ → students fell asleep", back: "tedious" },
      { front: "Evidence was ___ → didn't convince jury", back: "circumstantial" },
    ],
    se: [
      { front: "Results were ___; no one expected change", back: "startling" },
      { front: "Politician known for ___ (word pair)", back: "verbose, rambling" },
    ],
    rc: [
      { front: "Main topic of plate tectonics passage", back: "Crust movement" },
    ],
  },
  banking: {
    numerical: [
      { front: "25% of 640", back: "160" },
      { front: "√484", back: "22" },
      { front: "15% of 80", back: "12" },
      { front: "Ratio 3:5 = ?", back: "30:50" },
    ],
    reasoning: [
      { front: "Odd one: 2, 4, 8, 16, 24, 32", back: "24" },
      { front: "3, 6, 11, 18, ?", back: "27" },
      { front: "If yesterday was Thursday, day after tomorrow?", back: "Sunday" },
    ],
    english: [
      { front: "He is good ___ mathematics", back: "at" },
      { front: "Correct spelling", back: "Receive" },
      { front: "Synonym of 'Abandon'", back: "Leave" },
      { front: "Antonym of 'Expand'", back: "Contract" },
    ],
    ga: [
      { front: "RBI Governor (current)", back: "Sanjay Malhotra" },
      { front: "Bank of Banks in India", back: "RBI" },
      { front: "Capital of Australia", back: "Canberra" },
    ],
    computer: [
      { front: "CPU stands for", back: "Central Processing Unit" },
      { front: "Which is an input device?", back: "Keyboard" },
      { front: "RAM stands for", back: "Random Access Memory" },
      { front: "Email protocol", back: "SMTP" },
    ],
  },
};

export function getFlashcards(domain: string, topic: string): Flashcard[] {
  return FLASHCARDS_BY_DOMAIN[domain]?.[topic] ?? [];
}

export function getTopicsForDomain(domain: string): string[] {
  return Object.keys(FLASHCARDS_BY_DOMAIN[domain] ?? {});
}
