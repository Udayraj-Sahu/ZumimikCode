import type { Question, SprintSession } from "@/lib/types/sprint-session";

const TOTAL_TIME_PER_QUESTION = 30;

const QUESTIONS: Record<string, Question[]> = {
  addition: [
    { id: "add1", text: "What is 142 + 387?", options: ["429", "529", "539", "439"], correctIndex: 1, timeLimit: 15 },
    { id: "add2", text: "What is 256 + 189?", options: ["435", "445", "425", "455"], correctIndex: 1, timeLimit: 15 },
    { id: "add3", text: "What is 574 + 298?", options: ["862", "872", "852", "882"], correctIndex: 1, timeLimit: 15 },
    { id: "add4", text: "What is 1,234 + 567?", options: ["1,791", "1,801", "1,811", "1,781"], correctIndex: 1, timeLimit: 20 },
    { id: "add5", text: "What is 3,456 + 789?", options: ["4,235", "4,245", "4,225", "4,255"], correctIndex: 1, timeLimit: 20 },
    { id: "add6", text: "What is 99 + 99?", options: ["188", "198", "208", "178"], correctIndex: 1, timeLimit: 10 },
    { id: "add7", text: "What is 750 + 250?", options: ["900", "950", "1,000", "1,050"], correctIndex: 2, timeLimit: 10 },
    { id: "add8", text: "What is 1,999 + 1?", options: ["1,990", "2,000", "2,010", "1,999"], correctIndex: 1, timeLimit: 10 },
    { id: "add9", text: "What is 125 + 75?", options: ["190", "200", "210", "195"], correctIndex: 1, timeLimit: 10 },
    { id: "add10", text: "What is 2,468 + 3,579?", options: ["6,037", "6,047", "6,027", "6,057"], correctIndex: 1, timeLimit: 25 },
    { id: "add11", text: "What is 505 + 495?", options: ["990", "995", "1,000", "1,005"], correctIndex: 2, timeLimit: 10 },
    { id: "add12", text: "What is 1,111 + 2,222?", options: ["3,333", "3,433", "3,323", "3,233"], correctIndex: 0, timeLimit: 15 },
    { id: "add13", text: "What is 888 + 888?", options: ["1,666", "1,776", "1,776", "1,866"], correctIndex: 1, timeLimit: 15 },
    { id: "add14", text: "What is 123 + 987?", options: ["1,100", "1,010", "1,110", "1,120"], correctIndex: 2, timeLimit: 15 },
    { id: "add15", text: "What is 444 + 556?", options: ["1,000", "990", "1,010", "980"], correctIndex: 0, timeLimit: 10 },
    { id: "add16", text: "What is 777 + 333?", options: ["1,000", "1,100", "1,110", "1,010"], correctIndex: 2, timeLimit: 15 },
    { id: "add17", text: "What is 2,345 + 1,234?", options: ["3,569", "3,579", "3,589", "3,559"], correctIndex: 1, timeLimit: 20 },
    { id: "add18", text: "What is 50 + 250 + 100?", options: ["350", "400", "300", "450"], correctIndex: 1, timeLimit: 15 },
    { id: "add19", text: "What is 1,050 + 950?", options: ["1,900", "2,100", "2,000", "1,950"], correctIndex: 2, timeLimit: 10 },
    { id: "add20", text: "What is 333 + 667?", options: ["1,000", "990", "1,010", "980"], correctIndex: 0, timeLimit: 10 },
  ],
  subtraction: [
    { id: "sub1", text: "What is 500 - 237?", options: ["263", "273", "253", "283"], correctIndex: 0, timeLimit: 15 },
    { id: "sub2", text: "What is 1,000 - 456?", options: ["554", "544", "564", "534"], correctIndex: 1, timeLimit: 15 },
    { id: "sub3", text: "What is 800 - 329?", options: ["461", "471", "481", "451"], correctIndex: 1, timeLimit: 15 },
    { id: "sub4", text: "What is 2,500 - 1,750?", options: ["750", "650", "850", "950"], correctIndex: 0, timeLimit: 15 },
    { id: "sub5", text: "What is 10,000 - 1?", options: ["9,999", "9,990", "9,909", "9,099"], correctIndex: 0, timeLimit: 10 },
    { id: "sub6", text: "What is 600 - 298?", options: ["302", "312", "292", "322"], correctIndex: 0, timeLimit: 15 },
    { id: "sub7", text: "What is 1,234 - 567?", options: ["667", "677", "657", "687"], correctIndex: 0, timeLimit: 20 },
    { id: "sub8", text: "What is 3,000 - 1,500?", options: ["1,600", "1,400", "1,500", "1,550"], correctIndex: 2, timeLimit: 10 },
    { id: "sub9", text: "What is 720 - 90?", options: ["640", "630", "620", "650"], correctIndex: 1, timeLimit: 10 },
    { id: "sub10", text: "What is 5,555 - 1,111?", options: ["4,444", "4,544", "4,454", "4,445"], correctIndex: 0, timeLimit: 15 },
    { id: "sub11", text: "What is 1,050 - 500?", options: ["500", "550", "600", "450"], correctIndex: 1, timeLimit: 10 },
    { id: "sub12", text: "What is 999 - 111?", options: ["888", "878", "898", "889"], correctIndex: 0, timeLimit: 10 },
    { id: "sub13", text: "What is 2,000 - 1,999?", options: ["0", "1", "10", "100"], correctIndex: 1, timeLimit: 5 },
    { id: "sub14", text: "What is 400 - 199?", options: ["201", "211", "191", "221"], correctIndex: 0, timeLimit: 10 },
    { id: "sub15", text: "What is 7,500 - 2,500?", options: ["5,500", "4,500", "5,000", "6,000"], correctIndex: 2, timeLimit: 10 },
  ],
  multiplication: [
    { id: "mul1", text: "What is 12 × 15?", options: ["160", "170", "180", "190"], correctIndex: 2, timeLimit: 15 },
    { id: "mul2", text: "What is 25 × 8?", options: ["180", "190", "200", "210"], correctIndex: 2, timeLimit: 10 },
    { id: "mul3", text: "What is 11 × 11?", options: ["111", "121", "131", "141"], correctIndex: 1, timeLimit: 10 },
    { id: "mul4", text: "What is 50 × 50?", options: ["2,000", "2,500", "3,000", "3,500"], correctIndex: 1, timeLimit: 10 },
    { id: "mul5", text: "What is 7 × 13?", options: ["81", "91", "101", "111"], correctIndex: 1, timeLimit: 10 },
    { id: "mul6", text: "What is 16 × 25?", options: ["300", "350", "400", "450"], correctIndex: 2, timeLimit: 15 },
    { id: "mul7", text: "What is 125 × 8?", options: ["1,000", "1,100", "900", "1,200"], correctIndex: 0, timeLimit: 15 },
    { id: "mul8", text: "What is 14 × 14?", options: ["186", "196", "206", "176"], correctIndex: 1, timeLimit: 15 },
    { id: "mul9", text: "What is 9 × 12?", options: ["98", "108", "118", "128"], correctIndex: 1, timeLimit: 10 },
    { id: "mul10", text: "What is 15 × 15?", options: ["215", "225", "235", "245"], correctIndex: 1, timeLimit: 10 },
    { id: "mul11", text: "What is 6 × 7 × 8?", options: ["236", "246", "336", "346"], correctIndex: 2, timeLimit: 20 },
    { id: "mul12", text: "What is 20 × 35?", options: ["600", "650", "700", "750"], correctIndex: 2, timeLimit: 15 },
    { id: "mul13", text: "What is 99 × 1?", options: ["1", "99", "100", "9"], correctIndex: 1, timeLimit: 5 },
    { id: "mul14", text: "What is 5 × 5 × 5?", options: ["25", "125", "225", "625"], correctIndex: 1, timeLimit: 10 },
    { id: "mul15", text: "What is 30 × 40?", options: ["1,200", "1,000", "700", "1,500"], correctIndex: 0, timeLimit: 10 },
  ],
  division: [
    { id: "div1", text: "What is 144 ÷ 12?", options: ["10", "11", "12", "13"], correctIndex: 2, timeLimit: 10 },
    { id: "div2", text: "What is 500 ÷ 25?", options: ["15", "20", "25", "30"], correctIndex: 1, timeLimit: 15 },
    { id: "div3", text: "What is 1,000 ÷ 8?", options: ["120", "125", "130", "135"], correctIndex: 1, timeLimit: 15 },
    { id: "div4", text: "What is 360 ÷ 12?", options: ["20", "25", "30", "35"], correctIndex: 2, timeLimit: 10 },
    { id: "div5", text: "What is 99 ÷ 9?", options: ["9", "10", "11", "12"], correctIndex: 2, timeLimit: 10 },
    { id: "div6", text: "What is 256 ÷ 16?", options: ["14", "15", "16", "17"], correctIndex: 2, timeLimit: 15 },
    { id: "div7", text: "What is 750 ÷ 25?", options: ["20", "25", "30", "35"], correctIndex: 2, timeLimit: 15 },
    { id: "div8", text: "What is 81 ÷ 9?", options: ["7", "8", "9", "10"], correctIndex: 2, timeLimit: 5 },
    { id: "div9", text: "What is 200 ÷ 5?", options: ["25", "30", "35", "40"], correctIndex: 3, timeLimit: 10 },
    { id: "div10", text: "What is 1,000 ÷ 25?", options: ["20", "30", "40", "50"], correctIndex: 2, timeLimit: 15 },
    { id: "div11", text: "What is 48 ÷ 6?", options: ["6", "7", "8", "9"], correctIndex: 2, timeLimit: 5 },
    { id: "div12", text: "What is 1,000 ÷ 125?", options: ["6", "7", "8", "9"], correctIndex: 2, timeLimit: 15 },
  ],
  squares: [
    { id: "sq1", text: "What is 12²?", options: ["134", "144", "154", "164"], correctIndex: 1, timeLimit: 10 },
    { id: "sq2", text: "What is 15²?", options: ["215", "225", "235", "245"], correctIndex: 1, timeLimit: 10 },
    { id: "sq3", text: "What is 20²?", options: ["200", "300", "400", "500"], correctIndex: 2, timeLimit: 5 },
    { id: "sq4", text: "What is 25²?", options: ["525", "575", "625", "675"], correctIndex: 2, timeLimit: 10 },
    { id: "sq5", text: "What is 30²?", options: ["600", "700", "800", "900"], correctIndex: 3, timeLimit: 5 },
    { id: "sq6", text: "What is 11²?", options: ["111", "121", "131", "141"], correctIndex: 1, timeLimit: 5 },
    { id: "sq7", text: "What is 13²?", options: ["149", "159", "169", "179"], correctIndex: 2, timeLimit: 10 },
    { id: "sq8", text: "What is 18²?", options: ["304", "314", "324", "334"], correctIndex: 2, timeLimit: 10 },
    { id: "sq9", text: "What is 50²?", options: ["2,000", "2,500", "3,000", "3,500"], correctIndex: 1, timeLimit: 10 },
    { id: "sq10", text: "What is 9²?", options: ["18", "72", "81", "90"], correctIndex: 2, timeLimit: 5 },
    { id: "sq11", text: "What is 16²?", options: ["246", "256", "266", "276"], correctIndex: 1, timeLimit: 10 },
    { id: "sq12", text: "What is 14²?", options: ["186", "196", "206", "216"], correctIndex: 1, timeLimit: 10 },
    { id: "sq13", text: "What is 22²?", options: ["474", "484", "494", "504"], correctIndex: 1, timeLimit: 15 },
    { id: "sq14", text: "What is 100²?", options: ["1,000", "10,000", "100,000", "1,000,000"], correctIndex: 1, timeLimit: 5 },
    { id: "sq15", text: "What is 7²?", options: ["14", "21", "42", "49"], correctIndex: 3, timeLimit: 5 },
  ],
  mixed: [
    { id: "mix1", text: "What is (12 × 5) + 20?", options: ["60", "70", "80", "90"], correctIndex: 2, timeLimit: 20 },
    { id: "mix2", text: "What is 100 - (7 × 7)?", options: ["41", "51", "61", "71"], correctIndex: 1, timeLimit: 20 },
    { id: "mix3", text: "What is (150 ÷ 3) × 2?", options: ["50", "75", "100", "125"], correctIndex: 2, timeLimit: 20 },
    { id: "mix4", text: "What is 25 + 36 - 14?", options: ["47", "57", "37", "67"], correctIndex: 0, timeLimit: 15 },
    { id: "mix5", text: "What is 8 × 8 - 8?", options: ["48", "56", "64", "72"], correctIndex: 1, timeLimit: 15 },
    { id: "mix6", text: "What is (100 + 50) ÷ 5?", options: ["20", "25", "30", "35"], correctIndex: 2, timeLimit: 20 },
    { id: "mix7", text: "What is 7 × 11 + 3?", options: ["70", "77", "80", "87"], correctIndex: 2, timeLimit: 20 },
    { id: "mix8", text: "What is 200 - 45 + 12?", options: ["157", "167", "177", "187"], correctIndex: 1, timeLimit: 15 },
    { id: "mix9", text: "What is 9 × 6 ÷ 2?", options: ["27", "24", "21", "30"], correctIndex: 0, timeLimit: 15 },
    { id: "mix10", text: "What is 15 + 15 × 3?", options: ["60", "45", "90", "30"], correctIndex: 0, timeLimit: 20 },
    { id: "mix11", text: "What is 144 ÷ 12 + 5?", options: ["7", "12", "17", "22"], correctIndex: 2, timeLimit: 20 },
    { id: "mix12", text: "What is 30 × 4 - 50?", options: ["40", "50", "60", "70"], correctIndex: 3, timeLimit: 15 },
    { id: "mix13", text: "What is (5 + 5) × (5 + 5)?", options: ["20", "50", "100", "200"], correctIndex: 2, timeLimit: 20 },
    { id: "mix14", text: "What is 999 + 1 - 500?", options: ["400", "500", "600", "700"], correctIndex: 1, timeLimit: 10 },
    { id: "mix15", text: "What is 2 × 3 × 4 × 5?", options: ["60", "120", "180", "240"], correctIndex: 1, timeLimit: 20 },
  ],
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
): SprintSession {
  const topicLabel: Record<string, string> = {
    addition: "Rapid Addition",
    subtraction: "Fast Subtraction",
    multiplication: "Speed Mult.",
    division: "Quick Division",
    squares: "Mental Squares",
    mixed: "Mixed Challenge",
  };

  const pool = QUESTIONS[topic] ?? QUESTIONS.addition;
  const shuffled = shuffle(pool);
  const selected = shuffled.slice(0, Math.min(length, shuffled.length));
  const questions = selected.map((q) => ({
    ...q,
    timeLimit: difficulty === "Beginner" ? q.timeLimit + 10 : difficulty === "Advanced" ? Math.max(5, q.timeLimit - 5) : q.timeLimit,
  }));
  const totalTime = questions.length * TOTAL_TIME_PER_QUESTION;

  return {
    id: `sprint_${topic}_${Date.now()}`,
    topic,
    topicLabel: topicLabel[topic] ?? topic,
    difficulty,
    questions,
    totalTime,
  };
}
