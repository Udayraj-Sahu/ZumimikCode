import type { Question, SprintSession, TrustStatus } from "@/lib/types/sprint-session";

const TOTAL_TIME_PER_QUESTION = 30;

const TOPIC_TECHNIQUE_MAP: Record<string, Record<string, string[]>> = {
  gmat: {
    ps: ["work-rate", "speed-distance"],
    ds: ["data-sufficiency"],
    sc: ["sentence-correction-parallelism"],
    cr: [],
    rc: [],
  },
  cat: {
    qa: ["number-system-factors", "prime-factorization", "lcm-gcd"],
    lrdi: [],
    va: [],
  },
  gre: {
    qc: ["quant-comparison"],
    ps: ["work-rate"],
    tc: [],
    se: [],
    rc: [],
  },
  banking: {
    numerical: ["percentage-tricks"],
    reasoning: [],
    english: [],
    ga: [],
    computer: [],
  },
};

const sourceCounter = { count: 0 };

function enrichQuestion(q: Question, domain: string, topic: string): Question {
  const techniqueIds = TOPIC_TECHNIQUE_MAP[domain]?.[topic] ?? [];
  sourceCounter.count++;
  return {
    ...q,
    difficulty: q.timeLimit <= 10 ? 1 : q.timeLimit <= 20 ? 2 : q.timeLimit <= 30 ? 3 : q.timeLimit > 40 ? 5 : 4,
    techniqueId: techniqueIds.length > 0
      ? techniqueIds[q.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % techniqueIds.length]
      : undefined,
    trustStatus: "trusted" as TrustStatus,
    sourceId: `src-manual-${domain}-${sourceCounter.count}`,
    variantGroupId: undefined,
  };
}

// ── GMAT ──────────────────────────────────────────
const GMAT_QUESTIONS: Record<string, Question[]> = {
  ps: [
    { id: "gmat-ps1", text: "If 3x + 7 = 22, what is the value of x?", options: ["3", "5", "7", "9"], correctIndex: 1, timeLimit: 30 },
    { id: "gmat-ps2", text: "A car travels 240 miles at 60 mph. How many hours does the trip take?", options: ["2", "3", "4", "5"], correctIndex: 2, timeLimit: 30 },
    { id: "gmat-ps3", text: "What is 15% of 200?", options: ["20", "25", "30", "35"], correctIndex: 2, timeLimit: 20 },
    { id: "gmat-ps4", text: "If a shirt costs $45 after a 10% discount, what was the original price?", options: ["$48", "$49.50", "$50", "$55"], correctIndex: 2, timeLimit: 35 },
    { id: "gmat-ps5", text: "What is the average of 12, 18, 24, and 30?", options: ["18", "20", "21", "24"], correctIndex: 2, timeLimit: 25 },
    { id: "gmat-ps6", text: "If 2x + 3y = 13 and x = 2, what is y?", options: ["1", "2", "3", "4"], correctIndex: 2, timeLimit: 25 },
    { id: "gmat-ps7", text: "A rectangle has length 12 and width 5. What is its area?", options: ["34", "48", "60", "72"], correctIndex: 2, timeLimit: 15 },
    { id: "gmat-ps8", text: "What is 2^5?", options: ["16", "32", "64", "128"], correctIndex: 1, timeLimit: 10 },
    { id: "gmat-ps9", text: "If a:b = 2:3 and b = 9, what is a?", options: ["4", "5", "6", "7"], correctIndex: 2, timeLimit: 25 },
    { id: "gmat-ps10", text: "How many prime numbers are between 10 and 20?", options: ["3", "4", "5", "6"], correctIndex: 1, timeLimit: 20 },
  ],
  ds: [
    { id: "gmat-ds1", text: "Is x > 5? (1) x > 3 (2) x < 8", options: ["A) (1) alone", "B) (2) alone", "C) Both together", "D) Neither"], correctIndex: 2, timeLimit: 45 },
    { id: "gmat-ds2", text: "What is the value of x? (1) x + y = 10 (2) y = 4", options: ["A) (1) alone", "B) (2) alone", "C) Both together", "D) Neither"], correctIndex: 2, timeLimit: 40 },
    { id: "gmat-ds3", text: "Is n even? (1) n is divisible by 4 (2) n + 1 is odd", options: ["A) (1) alone", "B) (2) alone", "C) Either alone", "D) Both together"], correctIndex: 2, timeLimit: 40 },
    { id: "gmat-ds4", text: "What is the area of a triangle? (1) base = 6 (2) height = 4", options: ["A) (1) alone", "B) (2) alone", "C) Both together", "D) Neither"], correctIndex: 2, timeLimit: 35 },
    { id: "gmat-ds5", text: "Is x positive? (1) x^2 = 9 (2) x > 0", options: ["A) (1) alone", "B) (2) alone", "C) Either alone", "D) Neither"], correctIndex: 1, timeLimit: 35 },
  ],
  sc: [
    { id: "gmat-sc1", text: "The team ___ hard for the championship match.", options: ["train", "trains", "training", "have trained"], correctIndex: 1, timeLimit: 30 },
    { id: "gmat-sc2", text: "Neither the manager nor the employees ___ satisfied with the decision.", options: ["was", "were", "has been", "is"], correctIndex: 1, timeLimit: 35 },
    { id: "gmat-sc3", text: "She is taller than ___.", options: ["I", "me", "myself", "mine"], correctIndex: 0, timeLimit: 25 },
    { id: "gmat-sc4", text: "Each of the students ___ required to submit the form.", options: ["are", "is", "were", "have been"], correctIndex: 1, timeLimit: 25 },
    { id: "gmat-sc5", text: "The report includes data on inflation, unemployment, and ___.", options: ["growing the economy", "economic growth", "how the economy grows", "the economy growing"], correctIndex: 1, timeLimit: 35 },
  ],
  cr: [
    { id: "gmat-cr1", text: "All roses are flowers. Some flowers fade quickly. Therefore...", options: ["All roses fade quickly", "Some roses may fade quickly", "No flowers fade slowly", "All flowers are roses"], correctIndex: 1, timeLimit: 40 },
    { id: "gmat-cr2", text: "If it rains, the ground gets wet. The ground is wet. Therefore...", options: ["It must have rained", "It may not have rained", "The ground is always wet", "Rain is the only cause"], correctIndex: 1, timeLimit: 40 },
    { id: "gmat-cr3", text: "Company profits rose 20% after the new CEO took over. The new CEO must be effective. What is the flaw?", options: ["Correlation vs causation", "Circular reasoning", "False dilemma", "Hasty generalization"], correctIndex: 0, timeLimit: 45 },
    { id: "gmat-cr4", text: "Studies show students who eat breakfast score higher on tests. Which would strengthen this?", options: ["Breakfast provides glucose for brain", "Some students skip breakfast", "Lunch is also important", "Test scores vary by subject"], correctIndex: 0, timeLimit: 45 },
  ],
  rc: [
    { id: "gmat-rc1", text: "Passage: The Industrial Revolution began in England in the late 18th century. It transformed manufacturing, transportation, and daily life. What is the main idea?", options: ["England dominated world trade", "The Industrial Revolution had widespread impact", "Manufacturing was the only change", "The 18th century was peaceful"], correctIndex: 1, timeLimit: 50 },
    { id: "gmat-rc2", text: "Passage: Photosynthesis converts sunlight into chemical energy. Plants absorb CO2 and release O2. What is NOT mentioned?", options: ["Sunlight is used", "Oxygen is released", "Plants need water", "CO2 is absorbed"], correctIndex: 2, timeLimit: 50 },
    { id: "gmat-rc3", text: "Passage: The author argues that urban green spaces improve mental health. Which would weaken this argument?", options: ["Parks increase property values", "Some people prefer indoor activities", "Studies show correlation, not causation", "Green spaces require maintenance"], correctIndex: 2, timeLimit: 55 },
  ],
};

// ── CAT ────────────────────────────────────────────
const CAT_QUESTIONS: Record<string, Question[]> = {
  qa: [
    { id: "cat-qa1", text: "A train 150m long passes a pole in 15 seconds. What is its speed in km/h?", options: ["30", "36", "42", "48"], correctIndex: 1, timeLimit: 40 },
    { id: "cat-qa2", text: "If the price of sugar increases by 20%, by what percent must consumption be reduced to keep expenditure the same?", options: ["16.67%", "20%", "25%", "33.33%"], correctIndex: 0, timeLimit: 45 },
    { id: "cat-qa3", text: "What is the LCM of 12, 18, and 24?", options: ["36", "48", "72", "96"], correctIndex: 2, timeLimit: 25 },
    { id: "cat-qa4", text: "A can do a job in 10 days, B in 15 days. How many days together?", options: ["5", "6", "7", "8"], correctIndex: 1, timeLimit: 30 },
    { id: "cat-qa5", text: "If log₂x = 5, what is x?", options: ["16", "25", "32", "64"], correctIndex: 2, timeLimit: 20 },
    { id: "cat-qa6", text: "What is the sum of first 10 natural numbers?", options: ["45", "50", "55", "60"], correctIndex: 2, timeLimit: 15 },
    { id: "cat-qa7", text: "A shopkeeper sells at 20% profit. If cost price is ₹500, what is selling price?", options: ["₹550", "₹580", "₹600", "₹620"], correctIndex: 2, timeLimit: 20 },
  ],
  lrdi: [
    { id: "cat-lrdi1", text: "Five friends sit in a row. A is to the left of B. C is at an end. D is between A and B. Who is at the other end?", options: ["A", "B", "E", "Cannot determine"], correctIndex: 2, timeLimit: 50 },
    { id: "cat-lrdi2", text: "In a code language, CAT is coded as 3120. How is DOG coded?", options: ["4157", "4517", "7415", "1547"], correctIndex: 0, timeLimit: 45 },
    { id: "cat-lrdi3", text: "A pie chart shows 40% students in Science, 30% in Arts, 20% in Commerce, 10% in others. If total is 500, how many in Arts?", options: ["100", "120", "150", "200"], correctIndex: 2, timeLimit: 30 },
    { id: "cat-lrdi4", text: "If 3 pens cost ₹45, what is the cost of 8 pens?", options: ["₹100", "₹110", "₹120", "₹135"], correctIndex: 2, timeLimit: 20 },
  ],
  va: [
    { id: "cat-va1", text: "Choose the correct spelling:", options: ["Accommodate", "Acommodate", "Accomodate", "Acomodate"], correctIndex: 0, timeLimit: 20 },
    { id: "cat-va2", text: "Select the synonym of 'Benevolent':", options: ["Cruel", "Kind", "Weak", "Strong"], correctIndex: 1, timeLimit: 20 },
    { id: "cat-va3", text: "Complete the analogy: Book : Read :: Food : ___", options: ["Cook", "Eat", "Buy", "Store"], correctIndex: 1, timeLimit: 20 },
    { id: "cat-va4", text: "Choose the antonym of 'Abundant':", options: ["Plentiful", "Scarce", "Rich", "Ample"], correctIndex: 1, timeLimit: 20 },
    { id: "cat-va5", text: "Fill in the blank: She ___ the piano since she was five.", options: ["plays", "played", "has played", "is playing"], correctIndex: 2, timeLimit: 25 },
  ],
};

// ── GRE ────────────────────────────────────────────
const GRE_QUESTIONS: Record<string, Question[]> = {
  qc: [
    { id: "gre-qc1", text: "Quantity A: 2/3 of 90. Quantity B: 60. Which is greater?", options: ["A is greater", "B is greater", "Equal", "Cannot determine"], correctIndex: 2, timeLimit: 25 },
    { id: "gre-qc2", text: "Quantity A: x^2 when x = -3. Quantity B: 9.", options: ["A is greater", "B is greater", "Equal", "Cannot determine"], correctIndex: 2, timeLimit: 20 },
    { id: "gre-qc3", text: "Quantity A: 0.25. Quantity B: 1/4.", options: ["A is greater", "B is greater", "Equal", "Cannot determine"], correctIndex: 2, timeLimit: 15 },
    { id: "gre-qc4", text: "Quantity A: √144. Quantity B: 12.", options: ["A is greater", "B is greater", "Equal", "Cannot determine"], correctIndex: 2, timeLimit: 10 },
    { id: "gre-qc5", text: "Quantity A: Perimeter of a square with side 5. Quantity B: 20.", options: ["A is greater", "B is greater", "Equal", "Cannot determine"], correctIndex: 2, timeLimit: 20 },
  ],
  ps: [
    { id: "gre-ps1", text: "If 2x - 5 = 7, what is x?", options: ["4", "5", "6", "7"], correctIndex: 2, timeLimit: 20 },
    { id: "gre-ps2", text: "What is 0.2 × 0.3?", options: ["0.06", "0.6", "0.006", "6.0"], correctIndex: 0, timeLimit: 15 },
    { id: "gre-ps3", text: "A circle has radius 7. What is its area? (π = 22/7)", options: ["144", "154", "164", "174"], correctIndex: 1, timeLimit: 25 },
    { id: "gre-ps4", text: "How many degrees are in a right angle?", options: ["45", "90", "180", "360"], correctIndex: 1, timeLimit: 10 },
    { id: "gre-ps5", text: "If n! = 24, what is n?", options: ["2", "3", "4", "5"], correctIndex: 2, timeLimit: 20 },
    { id: "gre-ps6", text: "What is the median of 3, 7, 2, 9, 5?", options: ["3", "5", "7", "9"], correctIndex: 1, timeLimit: 20 },
  ],
  tc: [
    { id: "gre-tc1", text: "Despite his ___ nature, he was surprisingly generous.", options: ["affable", "stingy", "gregarious", "timid"], correctIndex: 1, timeLimit: 35 },
    { id: "gre-tc2", text: "The professor's lecture was so ___ that most students fell asleep.", options: ["engaging", "lucid", "tedious", "brief"], correctIndex: 2, timeLimit: 30 },
    { id: "gre-tc3", text: "The evidence was ___ and failed to convince the jury.", options: ["conclusive", "circumstantial", "overwhelming", "persuasive"], correctIndex: 1, timeLimit: 35 },
    { id: "gre-tc4", text: "Her ___ smile put everyone at ease.", options: ["menacing", "warm", "sarcastic", "forced"], correctIndex: 1, timeLimit: 25 },
  ],
  se: [
    { id: "gre-se1", text: "The results were ___; no one expected such a dramatic change.", options: ["predictable", "startling", "mundane", "gradual"], correctIndex: 1, timeLimit: 35 },
    { id: "gre-se2", text: "Choose two words that complete the sentence: The politician was known for his ___ speeches.", options: ["terse", "verbose", "concise", "rambling"], correctIndex: [1, 3] as any, timeLimit: 40 },
    { id: "gre-se3", text: "The scientist's theory was so ___ that few could understand it.", options: ["simple", "abstruse", "clear", "superficial"], correctIndex: 1, timeLimit: 35 },
  ],
  rc: [
    { id: "gre-rc1", text: "Passage: Plate tectonics explains how Earth's crust moves. What is the main topic?", options: ["Earthquakes", "Crust movement", "Volcanoes", "Ocean formation"], correctIndex: 1, timeLimit: 40 },
    { id: "gre-rc2", text: "Passage: The author argues that renewable energy is essential. What is the primary purpose?", options: ["To criticize fossil fuels", "To advocate for renewables", "To describe solar power", "To compare energy sources"], correctIndex: 1, timeLimit: 45 },
  ],
};

// ── BANKING ────────────────────────────────────────
const BANKING_QUESTIONS: Record<string, Question[]> = {
  numerical: [
    { id: "bank-num1", text: "What is 25% of 640?", options: ["120", "140", "160", "180"], correctIndex: 2, timeLimit: 20 },
    { id: "bank-num2", text: "A sum of ₹5000 becomes ₹6000 in 2 years at simple interest. What is the rate?", options: ["5%", "8%", "10%", "12%"], correctIndex: 2, timeLimit: 35 },
    { id: "bank-num3", text: "What is the square root of 484?", options: ["18", "20", "22", "24"], correctIndex: 2, timeLimit: 15 },
    { id: "bank-num4", text: "If 5 men can complete work in 10 days, how many men for 2 days?", options: ["15", "20", "25", "30"], correctIndex: 2, timeLimit: 30 },
    { id: "bank-num5", text: "What is 15% of 80?", options: ["10", "11", "12", "13"], correctIndex: 2, timeLimit: 10 },
    { id: "bank-num6", text: "The ratio 3:5 is equivalent to:", options: ["30:50", "6:15", "9:25", "12:25"], correctIndex: 0, timeLimit: 15 },
    { id: "bank-num7", text: "A train covers 240 km in 4 hours. What is its speed?", options: ["40 km/h", "50 km/h", "60 km/h", "70 km/h"], correctIndex: 2, timeLimit: 15 },
  ],
  reasoning: [
    { id: "bank-reas1", text: "Find the odd one: 2, 4, 8, 16, 24, 32", options: ["4", "8", "24", "32"], correctIndex: 2, timeLimit: 25 },
    { id: "bank-reas2", text: "If APPLE is coded as BQQMF, what is ORANGE?", options: ["PSBOHF", "PSBOHG", "PSBOHD", "PSBODF"], correctIndex: 0, timeLimit: 40 },
    { id: "bank-reas3", text: "In a row of 40 students, Ravi is 15th from left. What is his rank from right?", options: ["24th", "25th", "26th", "27th"], correctIndex: 2, timeLimit: 25 },
    { id: "bank-reas4", text: "Which number replaces '?': 3, 6, 11, 18, ?", options: ["25", "27", "29", "31"], correctIndex: 1, timeLimit: 30 },
    { id: "bank-reas5", text: "If yesterday was Thursday, what is day after tomorrow?", options: ["Saturday", "Sunday", "Monday", "Tuesday"], correctIndex: 1, timeLimit: 20 },
  ],
  english: [
    { id: "bank-eng1", text: "Choose the correct preposition: He is good ___ mathematics.", options: ["in", "at", "on", "with"], correctIndex: 1, timeLimit: 15 },
    { id: "bank-eng2", text: "Select the correctly spelled word:", options: ["Recieve", "Receive", "Receeve", "Recive"], correctIndex: 1, timeLimit: 15 },
    { id: "bank-eng3", text: "Synonym of 'Abandon':", options: ["Keep", "Leave", "Cherish", "Protect"], correctIndex: 1, timeLimit: 15 },
    { id: "bank-eng4", text: "Antonym of 'Expand':", options: ["Grow", "Contract", "Increase", "Spread"], correctIndex: 1, timeLimit: 15 },
    { id: "bank-eng5", text: "He said, 'I am busy.' Change to indirect speech:", options: ["He said he is busy", "He said he was busy", "He says he was busy", "He said he has been busy"], correctIndex: 1, timeLimit: 30 },
  ],
  ga: [
    { id: "bank-ga1", text: "Who is the current RBI Governor?", options: ["Nirmala Sitharaman", "Shaktikanta Das", "Sanjay Malhotra", "Urjit Patel"], correctIndex: 2, timeLimit: 25 },
    { id: "bank-ga2", text: "Which bank is known as 'Bank of Banks' in India?", options: ["SBI", "RBI", "HDFC", "ICICI"], correctIndex: 1, timeLimit: 20 },
    { id: "bank-ga3", text: "What is the Goods and Services Tax (GST) Council's chairperson?", options: ["President", "Prime Minister", "Finance Minister", "RBI Governor"], correctIndex: 2, timeLimit: 25 },
    { id: "bank-ga4", text: "Which year was the Indian Constitution adopted?", options: ["1947", "1948", "1950", "1952"], correctIndex: 2, timeLimit: 20 },
    { id: "bank-ga5", text: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], correctIndex: 2, timeLimit: 15 },
  ],
  computer: [
    { id: "bank-comp1", text: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Unit", "Core Processing Unit"], correctIndex: 0, timeLimit: 15 },
    { id: "bank-comp2", text: "Which is an input device?", options: ["Monitor", "Printer", "Keyboard", "Speaker"], correctIndex: 2, timeLimit: 15 },
    { id: "bank-comp3", text: "What is the full form of RAM?", options: ["Read Access Memory", "Random Access Memory", "Rapid Access Memory", "Read And Memory"], correctIndex: 1, timeLimit: 15 },
    { id: "bank-comp4", text: "Which protocol is used for email?", options: ["HTTP", "FTP", "SMTP", "TCP"], correctIndex: 2, timeLimit: 20 },
    { id: "bank-comp5", text: "What does 'www' stand for?", options: ["World Wide Web", "World Web Wide", "Wide World Web", "Web World Wide"], correctIndex: 0, timeLimit: 10 },
  ],
};

const QUESTIONS_BY_DOMAIN: Record<string, Record<string, Question[]>> = {
  gmat: GMAT_QUESTIONS,
  cat: CAT_QUESTIONS,
  gre: GRE_QUESTIONS,
  banking: BANKING_QUESTIONS,
};

const TOPIC_LABELS: Record<string, Record<string, string>> = {
  gmat: {
    ps: "Problem Solving",
    ds: "Data Sufficiency",
    sc: "Sentence Correction",
    cr: "Critical Reasoning",
    rc: "Reading Comp.",
  },
  cat: {
    qa: "Quantitative Apt.",
    lrdi: "LR & DI",
    va: "Verbal Ability",
  },
  gre: {
    qc: "Quant Comparison",
    ps: "Problem Solving",
    tc: "Text Completion",
    se: "Sentence Equivalence",
    rc: "Reading Comp.",
  },
  banking: {
    numerical: "Numerical Ability",
    reasoning: "Reasoning",
    english: "English",
    ga: "General Awareness",
    computer: "Computer Knowledge",
  },
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateSprintSession(
  topic: string,
  length: number,
  difficulty: string,
  domain?: string,
): SprintSession {
  const d = domain ?? "cat";
  const pool = QUESTIONS_BY_DOMAIN[d]?.[topic] ?? [];
  const labels = TOPIC_LABELS[d] ?? TOPIC_LABELS["cat"];

  const shuffled = shuffle(pool);
  const selected = shuffled.slice(0, Math.min(length, shuffled.length));
  const questions = selected.map((q) => {
    const enriched = enrichQuestion(q, d, topic);
    return {
      ...enriched,
      timeLimit: difficulty === "Beginner" ? q.timeLimit + 10 : difficulty === "Advanced" ? Math.max(5, q.timeLimit - 5) : q.timeLimit,
    };
  });
  const totalTime = questions.length * TOTAL_TIME_PER_QUESTION;

  return {
    id: `sprint_${d}_${topic}_${Date.now()}`,
    domain: d,
    topic,
    topicLabel: labels[topic] ?? topic,
    difficulty,
    questions,
    totalTime,
  };
}

export type PaperSectionInput = {
  topic: string;
  questions: number;
};

export function buildPaperSession(
  domain: string,
  title: string,
  durationMinutes: number,
  sections: PaperSectionInput[],
): SprintSession {
  const d = domain ?? "cat";
  const questions: Question[] = [];
  for (const sec of sections) {
    const pool = QUESTIONS_BY_DOMAIN[d]?.[sec.topic] ?? [];
    if (pool.length === 0) continue;
    const target = Math.max(1, sec.questions);
    let count = 0;
    while (count < target) {
      questions.push(enrichQuestion(pool[count % pool.length], d, sec.topic));
      count++;
    }
  }
  return {
    id: `mock_${d}_${Date.now()}`,
    domain: d,
    topic: title,
    topicLabel: title,
    difficulty: "mock",
    questions,
    totalTime: durationMinutes * 60,
  };
}
