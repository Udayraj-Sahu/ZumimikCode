import type { Technique } from "@/lib/types/technique";

const TECHNIQUES_BY_ID: Record<string, Technique> = {
  // ── VEDIC MATH: NIKHILAM BASE 100 ─────────────────────────
  "nikhilam-base-100": {
    id: "nikhilam-base-100",
    subjectId: "vedic-math",
    topicPath: ["multiplication", "nikhilam"],
    name: "Nikhilam Sutra (Base 100)",
    quickReference: {
      formula: "(100 - a)(100 - b) = 100(100 - a - b) + ab",
      keyIdea: "When numbers are close to 100, find deviations from 100 and cross-subtract",
      shortcut: "Cross-subtract for left part, multiply deviations for right part",
      commonMistake: "Sign errors when deviations are negative; right part must be exactly 2 digits",
    },
    levels: {
      1: {
        level: 1,
        title: "Both Numbers Below Base",
        explanation: "When both numbers are less than 100, both deviations are negative. Subtract one deviation from the other number to get the left part. Multiply the deviations (ignoring sign) for the right part. The right part must be exactly 2 digits — pad with a leading zero if needed.",
        examples: [
          { problem: "97 × 94", steps: ["Deviations: 97 is -3 from 100, 94 is -6 from 100", "Left part: 97 - 6 = 91 (or 94 - 3 = 91)", "Right part: (-3) × (-6) = 18", "Answer: 91 | 18 → 9118"], answer: "9118" },
          { problem: "96 × 98", steps: ["Deviations: 96 is -4, 98 is -2", "Left part: 96 - 2 = 94", "Right part: (-4) × (-2) = 8 → pad to 08", "Answer: 94 | 08 → 9408"], answer: "9408" },
        ],
        questions: [
          { id: "n-b100-q1", text: "99 × 93 = ?", options: ["9207", "9217", "9307", "9407"], correctIndex: 0, explanation: "Deviations: -1, -7. Left: 99-7=92. Right: (-1)×(-7)=7 → 07. Answer: 9207" },
          { id: "n-b100-q2", text: "95 × 97 = ?", options: ["9215", "9315", "9225", "9115"], correctIndex: 0, explanation: "Deviations: -5, -3. Left: 95-3=92. Right: (-5)×(-3)=15. Answer: 9215" },
          { id: "n-b100-q3", text: "98 × 99 = ?", options: ["9602", "9702", "9802", "9502"], correctIndex: 1, explanation: "Deviations: -2, -1. Left: 98-1=97. Right: (-2)×(-1)=2 → 02. Answer: 9702" },
        ],
        commonTraps: ["Forgetting to pad the right part to 2 digits (e.g., writing 978 instead of 9708)", "Using positive deviations when numbers are below base"],
        speedTips: ["The deviation of a number from 100 is just the last two digits subtracted from 100", "Practice with numbers ending in 9, 8, 7 first — they have small deviations"],
      },
      2: {
        level: 2,
        title: "Both Numbers Above Base",
        explanation: "When both numbers are above 100, both deviations are positive. Add one deviation to the other number for the left part. Multiply the deviations for the right part. Right part must be exactly 2 digits — if exceeds 99, carry the excess to the left part.",
        examples: [
          { problem: "103 × 105", steps: ["Deviations: 103 is +3, 105 is +5", "Left part: 103 + 5 = 108 (or 105 + 3 = 108)", "Right part: 3 × 5 = 15", "Answer: 108 | 15 → 10815"], answer: "10815" },
          { problem: "112 × 111", steps: ["Deviations: 112 is +12, 111 is +11", "Left part: 112 + 11 = 123", "Right part: 12 × 11 = 132 (carry 1 to left part)", "Left becomes 123 + 1 = 124, right becomes 32", "Answer: 12432"], answer: "12432" },
        ],
        questions: [
          { id: "n-b100-q4", text: "102 × 106 = ?", options: ["10812", "10712", "10912", "10612"], correctIndex: 0, explanation: "Deviations: +2, +6. Left: 102+6=108. Right: 2×6=12. Answer: 10812" },
          { id: "n-b100-q5", text: "108 × 107 = ?", options: ["11556", "11456", "11656", "11356"], correctIndex: 0, explanation: "Deviations: +8, +7. Left: 108+7=115. Right: 8×7=56. Answer: 11556" },
        ],
        commonTraps: ["Forgetting to carry when right part exceeds 99", "Adding deviations incorrectly when both are positive"],
        speedTips: ["Think 'cross-add' instead of 'cross-subtract' when above base", "For 10x-level numbers, the right part is the product of the last digits"],
      },
      3: {
        level: 3,
        title: "One Above, One Below Base",
        explanation: "When one number is above and one is below 100, one deviation is positive and the other negative. Cross-subtract (or cross-add depending on sign) for the left part. Multiply the deviations — the result is negative, so subtract from the left part.",
        examples: [
          { problem: "104 × 96", steps: ["Deviations: +4 (above), -4 (below)", "Left part: 104 - 4 = 100 (or 96 + 4 = 100)", "Right part: (+4) × (-4) = -16", "Since right part is negative: 10000 - 16 = 9984"], answer: "9984" },
          { problem: "105 × 93", steps: ["Deviations: +5 (above), -7 (below)", "Left part: 105 - 7 = 98 (or 93 + 5 = 98)", "Right part: 5 × (-7) = -35", "98 × 100 = 9800, then 9800 - 35 = 9765"], answer: "9765" },
        ],
        questions: [
          { id: "n-b100-q6", text: "103 × 97 = ?", options: ["9991", "9992", "9993", "9994"], correctIndex: 0, explanation: "Deviations: +3, -3. Left: 103-3=100. Right: 3×(-3)=-9. 10000-9=9991" },
          { id: "n-b100-q7", text: "106 × 94 = ?", options: ["9964", "9954", "9974", "9944"], correctIndex: 0, explanation: "Left: 106-6=100. Right: 6×(-6)=-36. 10000-36=9964" },
        ],
        commonTraps: ["Forgetting that the right part is negative and must be subtracted", "Incorrectly applying absolute values to deviations"],
        speedTips: ["When deviations are equal and opposite (+x and -x), left = 100 and right = -x²", "The answer will always be slightly less than 10000"],
      },
      4: {
        level: 4,
        title: "Numbers Near Other Bases",
        explanation: "The same technique works for bases other than 100. For numbers near 50, 200, 1000, etc., find the appropriate base and adjust accordingly. The base determines the place value of the right part.",
        examples: [
          { problem: "48 × 47 (base 50)", steps: ["Base is 50. Deviations from 50: -2, -3", "Left part: 48 - 3 = 45", "Multiply left by base/100: 45 × 50 = 2250", "Right part: (-2) × (-3) = 6", "Answer: 2250 + 6 = 2256"], answer: "2256" },
          { problem: "204 × 197 (base 200)", steps: ["Base is 200. Deviations: +4, -3", "Left part: 204 - 3 = 201", "Multiply by 200/100: 201 × 2 = 402", "Right part: 4 × (-3) = -12", "Answer: 40200 - 12 = 40188"], answer: "40188" },
        ],
        questions: [
          { id: "n-b100-q8", text: "46 × 49 (base 50) = ?", options: ["2254", "2154", "2354", "2454"], correctIndex: 0, explanation: "Deviations: -4, -1. Left: 46-1=45. ×50: 2250. Right: (-4)×(-1)=4. Answer: 2254" },
        ],
        commonTraps: ["Forgetting to multiply the left part by the base factor", "Using wrong place value for the right part"],
        speedTips: ["For base 50, halve the left part then double it back", "Any round number can serve as a base"],
      },
      5: {
        level: 5,
        title: "Multiple Base Adjustments",
        explanation: "When numbers are far from a single base, use a combination of bases or apply the technique iteratively. This level combines Nikhilam with other Vedic methods for maximum speed.",
        examples: [
          { problem: "997 × 994 (base 1000)", steps: ["Deviations from 1000: -3, -6", "Left part: 997 - 6 = 991", "Right part: (-3) × (-6) = 18 → pad to 018 (3 digits)", "Answer: 991 | 018 → 991018"], answer: "991018" },
          { problem: "988 × 1012", steps: ["Recognize 988 = 1000 - 12, 1012 = 1000 + 12", "This is (a-b)(a+b) = a² - b² where a=1000, b=12", "1000² = 1,000,000; 12² = 144", "Answer: 1,000,000 - 144 = 999,856"], answer: "999856" },
        ],
        questions: [
          { id: "n-b100-q9", text: "996 × 993 = ?", options: ["989028", "988028", "990028", "987028"], correctIndex: 0, explanation: "Deviations: -4, -7. Left: 996-7=989. Right: (-4)×(-7)=28→028. Answer: 989028" },
        ],
        commonTraps: ["Padding right part to wrong number of digits (must match base zeros)", "Not recognizing (a-b)(a+b) patterns"],
        speedTips: ["For numbers near 1000, right part is always 3 digits (pad with zeros)", "Look for complementary pairs — equal deviations above and below base"],
      },
    },
  },

  // ── VEDIC MATH: NIKHILAM BASE 1000 ───────────────────────
  "nikhilam-base-1000": {
    id: "nikhilam-base-1000",
    subjectId: "vedic-math",
    topicPath: ["multiplication", "nikhilam"],
    name: "Nikhilam Sutra (Base 1000)",
    quickReference: {
      formula: "(1000 - a)(1000 - b) = 1000(1000 - a - b) + ab",
      keyIdea: "Same as base 100 but with 3-digit padding — extends naturally to any power of 10",
      shortcut: "Cross-subtract, pad right part to 3 digits, concatenate",
      commonMistake: "Padding right part to only 2 digits instead of 3",
    },
    levels: {
      1: {
        level: 1,
        title: "Both Below 1000",
        explanation: "The technique is identical to base 100 but the right part must have exactly 3 digits (since 1000 has 3 zeros). If the product of deviations has fewer than 3 digits, pad with leading zeros.",
        examples: [
          { problem: "998 × 997", steps: ["Deviations: -2, -3", "Left part: 998 - 3 = 995", "Right part: (-2) × (-3) = 6 → pad to 006", "Answer: 995 | 006 → 995006"], answer: "995006" },
          { problem: "993 × 991", steps: ["Deviations: -7, -9", "Left part: 993 - 9 = 984", "Right part: (-7) × (-9) = 63 → pad to 063", "Answer: 984 | 063 → 984063"], answer: "984063" },
        ],
        questions: [
          { id: "n-b1000-q1", text: "999 × 996 = ?", options: ["995004", "994004", "996004", "995014"], correctIndex: 0, explanation: "Deviations: -1, -4. Left: 999-4=995. Right: (-1)×(-4)=4→004. Answer: 995004" },
          { id: "n-b1000-q2", text: "995 × 988 = ?", options: ["983060", "984060", "982060", "985060"], correctIndex: 0, explanation: "Deviations: -5, -12. Left: 995-12=983. Right: (-5)×(-12)=60→060. Answer: 983060" },
        ],
        commonTraps: ["Padding to only 2 digits — must be 3 digits for base 1000", "Using 100 as base instead of 1000 for 3-digit numbers"],
        speedTips: ["Any 3-digit number's deviation from 1000 is just 1000 minus the number", "Right part pads to exactly the number of zeros in the base"],
      },
      2: {
        level: 2,
        title: "Above and Below 1000",
        explanation: "Handle mixed signs just like base 100 but with 3-digit right parts. When the right part is negative, the answer is left × 1000 minus the absolute value of the right part.",
        examples: [
          { problem: "1005 × 992", steps: ["Deviations: +5, -8", "Left part: 1005 - 8 = 997", "Right part: 5 × (-8) = -40", "Answer: 997000 - 40 = 996960"], answer: "996960" },
          { problem: "1010 × 989", steps: ["Deviations: +10, -11", "Left part: 1010 - 11 = 999", "Right part: 10 × (-11) = -110", "Answer: 999000 - 110 = 998890"], answer: "998890" },
        ],
        questions: [
          { id: "n-b1000-q3", text: "1003 × 995 = ?", options: ["997985", "998985", "996985", "997985"], correctIndex: 0, explanation: "Deviations: +3, -5. Left: 1003-5=998. Right: 3×(-5)=-15. 998000-15=997985" },
        ],
        commonTraps: ["Adding right part instead of subtracting when it's negative", "Using 2-digit padding for the right part"],
        speedTips: ["When deviations cancel out (equal above and below), left = sum of numbers - base", "For +x and -x, answer = base² - x²"],
      },
      3: {
        level: 3,
        title: "Multiples of 1000",
        explanation: "When one or both numbers are close to multiples of 1000 (like 2000, 3000), use the multiple as the base. The adjustment factor multiplies both the left and right parts appropriately.",
        examples: [
          { problem: "1998 × 1997 (base 2000)", steps: ["Deviations from 2000: -2, -3", "Left part: 1998 - 3 = 1995", "Since base is 2000 (2×1000), left × 2: 1995 × 2 = 3990", "Right part: 6 → pad to 006", "Answer: 3990 | 006 → 3990006"], answer: "3990006" },
        ],
        questions: [
          { id: "n-b1000-q4", text: "1996 × 1999 = ?", options: ["3990004", "3992004", "3980004", "3991004"], correctIndex: 0, explanation: "Deviations: -4, -1. Left: 1996-1=1995. ×2: 3990. Right: 4→004. Answer: 3990004" },
        ],
        commonTraps: ["Forgetting to multiply left part by the base multiple", "Using 1000× instead of 2000× for the left part"],
        speedTips: ["Think of (2×1000 - a)(2×1000 - b) as 2×[1000(2000 - a - b) + ab/2]", "Practice with 2000, 3000, 5000 bases for competitive exams"],
      },
    },
  },

  // ── VEDIC MATH: VERTICAL & CROSSWISE ─────────────────────
  "vert-cross-2digit": {
    id: "vert-cross-2digit",
    subjectId: "vedic-math",
    topicPath: ["multiplication", "vert-cross"],
    name: "Vertical & Crosswise (2-digit)",
    quickReference: {
      formula: "For ab × cd = (a×c) | (a×d + b×c) | (b×d)",
      keyIdea: "Multiply vertically for ends, crosswise for middle — single line, no separate partial products",
      shortcut: "Right: b×d, Middle: a×d + b×c, Left: a×c — handle carries leftward",
      commonMistake: "Forgetting carries from middle to left or from right to middle",
    },
    levels: {
      1: {
        level: 1,
        title: "No Carries",
        explanation: "When all partial products are less than 10, the answer is simply: left digit × left digit | cross addition | right digit × right digit. No carries needed.",
        examples: [
          { problem: "21 × 32", steps: ["Left (vertical): 2 × 3 = 6", "Middle (crosswise): 2×2 + 1×3 = 4 + 3 = 7", "Right (vertical): 1 × 2 = 2", "Answer: 6 | 7 | 2 → 672"], answer: "672" },
          { problem: "11 × 22", steps: ["Left: 1 × 2 = 2", "Middle: 1×2 + 1×2 = 4", "Right: 1 × 2 = 2", "Answer: 244"], answer: "244" },
        ],
        questions: [
          { id: "vc-2-q1", text: "31 × 22 = ?", options: ["682", "662", "672", "692"], correctIndex: 0, explanation: "Left: 3×2=6. Middle: 3×2+1×2=8. Right: 1×2=2. Answer: 682" },
          { id: "vc-2-q2", text: "12 × 21 = ?", options: ["252", "262", "242", "272"], correctIndex: 0, explanation: "Left: 1×2=2. Middle: 1×1+2×2=5. Right: 2×1=2. Answer: 252" },
        ],
        commonTraps: ["Treating crosswise as a×b + c×d instead of a×d + b×c", "Only multiplying one cross pair"],
        speedTips: ["Draw a cross (×) connecting the digits to visualize which pairs to multiply", "Practice with numbers composed of small digits (1, 2, 3) first"],
      },
      2: {
        level: 2,
        title: "Single Carries",
        explanation: "When the right part (b×d) exceeds 9, carry the tens digit to the middle. When the middle exceeds 9, carry its tens digit to the left. Always work right-to-left.",
        examples: [
          { problem: "23 × 41", steps: ["Right: 3 × 1 = 3 (no carry)", "Middle: 2×1 + 3×4 = 2 + 12 = 14 → write 4, carry 1", "Left: 2×4 = 8 + carry 1 = 9", "Answer: 943"], answer: "943" },
          { problem: "34 × 52", steps: ["Right: 4 × 2 = 8", "Middle: 3×2 + 4×5 = 6 + 20 = 26 → write 6, carry 2", "Left: 3×5 = 15 + carry 2 = 17", "Answer: 1768"], answer: "1768" },
        ],
        questions: [
          { id: "vc-2-q3", text: "42 × 53 = ?", options: ["2226", "2126", "2326", "2426"], correctIndex: 0, explanation: "Right: 2×3=6. Middle: 4×3+2×5=12+10=22→2,carry2. Left: 4×5=20+2=22. Answer: 2226" },
          { id: "vc-2-q4", text: "24 × 31 = ?", options: ["744", "734", "754", "724"], correctIndex: 0, explanation: "Right: 4×1=4. Middle: 2×1+4×3=2+12=14→4,carry1. Left: 2×3=6+1=7. Answer: 744" },
        ],
        commonTraps: ["Forgetting to add the carry from the right to the middle", "Applying carries left-to-right instead of right-to-left"],
        speedTips: ["Write dots above digits to track carries", "The carry from right to middle is always the tens digit of b×d"],
      },
      3: {
        level: 3,
        title: "Multiple & Cascading Carries",
        explanation: "When both right and middle parts generate carries, handle them sequentially. In some cases, a carry from the middle can propagate the left part into an additional digit.",
        examples: [
          { problem: "89 × 76", steps: ["Right: 9 × 6 = 54 → write 4, carry 5", "Middle: 8×6 + 9×7 = 48 + 63 = 111 + carry 5 = 116 → write 6, carry 11", "Left: 8×7 = 56 + carry 11 = 67", "Answer: 6764"], answer: "6764" },
          { problem: "99 × 88", steps: ["Right: 9 × 8 = 72 → write 2, carry 7", "Middle: 9×8 + 9×8 = 72 + 72 = 144 + carry 7 = 151 → write 1, carry 15", "Left: 9×8 = 72 + carry 15 = 87", "Answer: 8712"], answer: "8712" },
        ],
        questions: [
          { id: "vc-2-q5", text: "67 × 58 = ?", options: ["3886", "3786", "3986", "3686"], correctIndex: 0, explanation: "Right: 7×8=56→6,c5. Middle: 6×8+7×5=48+35=83+5=88→8,c8. Left: 6×5=30+8=38. Answer: 3886" },
        ],
        commonTraps: ["Underestimating large carries (carry of 11, 15 are possible)", "Forgetting that the answer can be 4 digits even when both inputs are 2-digit"],
        speedTips: ["The maximum carry to the left is bounded by the middle sum + right carry", "Large carries indicate the answer will have more digits than usual"],
      },
      4: {
        level: 4,
        title: "Mixed with Nikhilam",
        explanation: "When the crosswise method becomes computation-heavy (large digits), switch to Nikhilam for the same problem. Learn to recognize which method is faster for a given pair.",
        examples: [
          { problem: "96 × 93", steps: ["Crosswise: 9×9=81 (left), 9×3+6×9=27+54=81 (middle), 6×3=18 (right)", "Middle: 81 → write 1, carry 8", "Left: 81 + 8 = 89", "Answer: 8918", "Faster way: Nikhilam — deviations -4, -7 → (96-7)|28 = 89|28 = 8928... wait, 96-7=89, (-4)×(-7)=28", "Actually 8928 ≠ 8918 → Let's recalc: 96×93 = 8928. Crosswise with carries gives same: 96×93 = 8928"], answer: "8928" },
        ],
        questions: [
          { id: "vc-2-q6", text: "Which method is faster for 98 × 97?", options: ["Nikhilam", "Vertical & Crosswise", "Same speed", "Neither"], correctIndex: 0, explanation: "Both work, but Nikhilam is simpler: deviations -2, -3 → (98-3) | 06 = 9506. Crosswise requires larger middle products." },
        ],
        commonTraps: ["Using a slow method when a faster alternative exists", "Second-guessing correct results from different methods"],
        speedTips: ["If digits are small (1-4), use Crosswise. If digits are large (7-9) and near a base, use Nikhilam.", "Always scan the pair before choosing the method"],
      },
    },
  },

  // ── VEDIC MATH: DIRECT DIVISION ──────────────────────────
  "direct-division": {
    id: "direct-division",
    subjectId: "vedic-math",
    topicPath: ["division", "direct"],
    name: "Direct Division",
    quickReference: {
      formula: "Dividend ÷ Divisor = Quotient + Remainder/Divisor",
      keyIdea: "Divide digit by digit from left to right, using a flag digit for faster 2-digit division",
      shortcut: "Flag method: for 2-digit divisor, use first digit as main and second as flag",
      commonMistake: "Forgetting to multiply the flag digit by the partial quotient before subtracting",
    },
    levels: {
      1: {
        level: 1,
        title: "Single-Digit Divisor",
        explanation: "Divide one digit at a time from left to right. Bring down each digit of the dividend and divide by the single-digit divisor. This is the foundation of all division methods.",
        examples: [
          { problem: "84 ÷ 7", steps: ["7 into 8 goes 1, remainder 1", "Bring down 4 → 14", "7 into 14 goes 2, remainder 0", "Answer: 12"], answer: "12" },
          { problem: "256 ÷ 4", steps: ["4 into 2 → too small, take 25", "4 into 25 goes 6, remainder 1", "Bring down 6 → 16", "4 into 16 goes 4, remainder 0", "Answer: 64"], answer: "64" },
        ],
        questions: [
          { id: "dd-1-q1", text: "144 ÷ 6 = ?", options: ["24", "26", "22", "28"], correctIndex: 0, explanation: "6 into 14 goes 2, remainder 2. Bring down 4 → 24. 6 into 24 goes 4. Answer: 24" },
          { id: "dd-1-q2", text: "315 ÷ 5 = ?", options: ["63", "65", "61", "67"], correctIndex: 0, explanation: "5 into 31 goes 6, remainder 1. Bring down 5 → 15. 5 into 15 goes 3. Answer: 63" },
        ],
        commonTraps: ["Dividing the whole number at once instead of digit by digit", "Forgetting to check if the first digit is smaller than the divisor"],
        speedTips: ["If the first digit is smaller than the divisor, always take the first two digits", "Master multiplication tables up to 12 for instant single-digit division"],
      },
      2: {
        level: 2,
        title: "Two-Digit Divisor — Flag Method",
        explanation: "For a 2-digit divisor, use the first digit as the 'main' divisor and the second digit as the 'flag'. Divide using the main divisor, then subtract the flag × partial quotient before bringing down the next digit.",
        examples: [
          { problem: "91 ÷ 13", steps: ["Main: 1, Flag: 3", "1 into 9 goes 9", "Subtract flag: 9 × 3 = 27, 91 - 27 = 64 → too big, try smaller", "Try 7: 1 into 9 → 7, remainder 2. Flag: 7×3=21, 21-21=0", "Answer: 7"], answer: "7" },
          { problem: "156 ÷ 12", steps: ["Main: 1, Flag: 2", "1 into 1 is 1, remainder 0. Bring down 5. Flag: 1×2=2, 5-2=3", "1 into 3 goes 3, remainder 0. Bring down 6. Flag: 3×2=6, 6-6=0", "Answer: 13"], answer: "13" },
        ],
        questions: [
          { id: "dd-2-q1", text: "168 ÷ 14 = ?", options: ["12", "14", "11", "13"], correctIndex: 0, explanation: "Main:1, Flag:4. 1 into 1→1, r0. 5-1×4=1. 1 into 6→6, 6-6×4=6-24→adjust. Actually 14×12=168. Working: 14|168 → 1|68 → 12, remainder 0" },
        ],
        commonTraps: ["Forgetting the flag subtraction step", "Using the wrong digit as the flag"],
        speedTips: ["The flag method converts 2-digit division into a series of 1-digit operations", "Always subtract flag × partial quotient before the next digit"],
      },
      3: {
        level: 3,
        title: "Larger Dividends with 2-Digit Divisor",
        explanation: "Apply the flag method to longer dividends. Process digit by digit, maintaining the flag subtraction at each step.",
        examples: [
          { problem: "828 ÷ 12", steps: ["Main:1, Flag:2", "1 into 8 goes 8, remainder 0. Flag: 8×2=16, 2-16→adjust", "Try 6: 1 into 8=6, r2. Flag: 6×2=12, 22-12=10", "1 into 10=10→too big for digit. Let's do standard: 12×69=828", "Answer: 69"], answer: "69" },
        ],
        questions: [
          { id: "dd-3-q1", text: "612 ÷ 18 = ?", options: ["34", "36", "32", "38"], correctIndex: 0, explanation: "18×34=612. Main:1, Flag:8. Working: 61÷18=3, r7. 72÷18=4, r0. Answer: 34" },
        ],
        commonTraps: ["Forgetting that partial quotient is a single digit (0-9)", "Misaligning the dividend digits after subtraction"],
        speedTips: ["If flag subtraction results in a negative, the partial quotient is too large — reduce by 1", "Flag is always the last digit of the divisor"],
      },
      4: {
        level: 4,
        title: "Division with Remainders",
        explanation: "When the dividend doesn't divide evenly, express the result as quotient + remainder/divisor. The flag method naturally produces the remainder as the final leftover.",
        examples: [
          { problem: "145 ÷ 12", steps: ["Main:1, Flag:2", "1 into 1 goes 1, remainder 0", "Flag: 1×2=2, 4-2=2", "1 into 2 goes 2, remainder 0. Bring down 5. Flag: 2×2=4, 5-4=1", "Answer: 12 remainder 1, or 12.0833..."], answer: "12 R1" },
          { problem: "359 ÷ 14", steps: ["Main:1, Flag:4", "14 × 25 = 350, remainder 9", "25 R 9"], answer: "25 R9" },
        ],
        questions: [
          { id: "dd-4-q1", text: "247 ÷ 15 = ?", options: ["16 R7", "15 R7", "16 R5", "17 R2"], correctIndex: 0, explanation: "15×16=240, remainder 7. Answer: 16 R7" },
        ],
        commonTraps: ["Reporting remainder larger than divisor", "Forgetting to include the remainder in the answer"],
        speedTips: ["Convert remainder to decimal by appending zeros and continuing the flag method", "A remainder check: remainder must always be less than the divisor"],
      },
      5: {
        level: 5,
        title: "Three-Digit Divisors",
        explanation: "For 3-digit divisors, use the first digit as main and the last two as the flag. The flag operation becomes a 2-digit multiplication: flag × partial quotient, subtracted from the working dividend.",
        examples: [
          { problem: "4526 ÷ 123", steps: ["Main:1, Flag:23", "123 × 36 = 4428, remainder 98", "First: 1 into 4 → 3, remainder 1. Flag: 3×23=69, 152-69=83", "1 into 83 → 6, remainder 77. Flag: 6×23=138, 776-138=638 → too big", "Adjust: 36 remainder 98."], answer: "36 R98" },
        ],
        questions: [
          { id: "dd-5-q1", text: "3125 ÷ 125 = ?", options: ["25", "26", "24", "27"], correctIndex: 0, explanation: "125×25=3125 exactly. Answer: 25" },
        ],
        commonTraps: ["Using only first digit for flag instead of two digits", "Overflow in flag multiplication (flag × partial quotient can be 2-digit)"],
        speedTips: ["For 3-digit divisors, the flag is always the last 2 digits", "Use Nikhilam for divisors near 100, 200, etc. — it's often faster"],
      },
    },
  },

  // ── VEDIC MATH: DIGITAL ROOT CHECK ───────────────────────
  "digital-root": {
    id: "digital-root",
    subjectId: "vedic-math",
    topicPath: ["squares", "digital-root"],
    name: "Digital Root Check",
    quickReference: {
      formula: "Digital root = sum of digits, repeated until single digit (mod 9)",
      keyIdea: "Every number's digital root can verify arithmetic — the digital root of the result must match the digital root of the operation",
      shortcut: "Cast out 9s — cross out digits that sum to 9 or multiples of 9",
      commonMistake: "Digital root of 9 is 9, not 0 (except for the number 0 itself)",
    },
    levels: {
      1: {
        level: 1,
        title: "Finding the Digital Root",
        explanation: "Add all digits of a number. If the sum has more than one digit, repeat until you get a single digit. This single digit is the digital root. Casting out 9s (crossing out pairs that sum to 9) makes it faster.",
        examples: [
          { problem: "Find digital root of 456", steps: ["4 + 5 + 6 = 15", "1 + 5 = 6", "Digital root: 6"], answer: "6" },
          { problem: "Find digital root of 7893", steps: ["Method 1: 7+8+9+3 = 27 → 2+7 = 9", "Method 2: Cast out 9s — 7+8+3 = 18 → 1+8 = 9, cross out 9", "Digital root: 9"], answer: "9" },
        ],
        questions: [
          { id: "dr-1-q1", text: "Digital root of 357?", options: ["6", "7", "5", "8"], correctIndex: 0, explanation: "3+5+7=15, 1+5=6" },
          { id: "dr-1-q2", text: "Digital root of 8829?", options: ["9", "8", "7", "0"], correctIndex: 0, explanation: "8+8+2+9=27, 2+7=9. Or cast 9→0, 8+8+2=18→9." },
        ],
        commonTraps: ["Treating 9 as 0 in the final result", "Stopping too early when the sum has multiple digits"],
        speedTips: ["Any digit 9 contributes 0 to the digital root (9 ≡ 0 mod 9)", "Cross out pairs that sum to 9 (like 1+8, 2+7, 3+6, 4+5) before adding"],
      },
      2: {
        level: 2,
        title: "Verifying Addition & Subtraction",
        explanation: "The digital root of a sum equals the digital root of the sum of digital roots. Similarly for subtraction. Use this to quickly check answers.",
        examples: [
          { problem: "Check 345 + 267 = 612", steps: ["DR(345) = 3+4+5 = 12 → 3", "DR(267) = 2+6+7 = 15 → 6", "DR(3 + 6) = 9", "DR(612) = 6+1+2 = 9", "✓ Match — answer is likely correct"], answer: "Valid" },
          { problem: "Check 741 - 258 = 483", steps: ["DR(741) = 7+4+1 = 12 → 3", "DR(258) = 2+5+8 = 15 → 6", "3 - 6 = -3 → DR(-3) = 6 (add 9)", "DR(483) = 4+8+3 = 15 → 6", "✓ Match"], answer: "Valid" },
        ],
        questions: [
          { id: "dr-2-q1", text: "Does 467 + 389 = 856 pass the digital root test?", options: ["Yes", "No"], correctIndex: 0, explanation: "DR(467)=8, DR(389)=2, DR(8+2)=1. DR(856)=1. ✓ Yes." },
        ],
        commonTraps: ["Forgetting that negative digital roots should have 9 added to make them positive", "Confusing modular arithmetic — 9 ≡ 0 but we keep 9 for single non-zero numbers"],
        speedTips: ["For subtraction, if DR(a) < DR(b), add 9 to DR(a) before subtracting", "This catches most arithmetic errors instantly"],
      },
      3: {
        level: 3,
        title: "Verifying Multiplication",
        explanation: "The digital root of a product equals the digital root of the product of the digital roots. This is extremely useful for mental verification.",
        examples: [
          { problem: "Check 56 × 43 = 2408", steps: ["DR(56) = 5+6 = 11 → 2", "DR(43) = 4+3 = 7", "DR(2 × 7 = 14) = 5", "DR(2408) = 2+4+0+8 = 14 → 5", "✓ Match"], answer: "Valid" },
          { problem: "Check 84 × 67 = 5628", steps: ["DR(84) = 3", "DR(67) = 4", "DR(3×4 = 12) = 3", "DR(5628) = 5+6+2+8 = 21 → 3", "✓ Match"], answer: "Valid" },
        ],
        questions: [
          { id: "dr-3-q1", text: "Check: 72 × 89 = 6408 — is the digital root valid?", options: ["Yes", "No"], correctIndex: 0, explanation: "DR(72)=9, DR(89)=8, DR(9×8=72)=9. DR(6408)=6+4+0+8=18→9. ✓ Yes." },
        ],
        commonTraps: ["Treating 0 as a valid digital root (only the number 0 has DR=0)", "Forgetting that DR(9) × DR(n) = DR(9n) = DR(9) = 9 for any n not divisible by 9"],
        speedTips: ["Any number with digital root 9 multiplied by anything gives digital root 9 (or 0 if the other is 0)", "This is the fastest way to catch multiplication errors"],
      },
      4: {
        level: 4,
        title: "Verifying Squares & Powers",
        explanation: "The digital root of a square can only be 0, 1, 4, 7, or 9. A perfect square never has digital root 2, 3, 5, 6, or 8. Similarly, cube digital roots follow a pattern.",
        examples: [
          { problem: "Is 343 a perfect square?", steps: ["DR(343) = 3+4+3 = 10 → 1", "1 is a valid square digital root, so it's possible", "But √343 = 18.52... (not integer), so no", "Digital root test is necessary, not sufficient"], answer: "No (not integer)" },
          { problem: "What are possible digital roots of perfect squares?", steps: ["0: 0² = 0 (but 0 is the only number)", "1: 1²=1, 8²=64→1, 10²=100→1", "4: 2²=4, 7²=49→4, 11²=121→4", "7: 4²=16→7, 5²=25→7, 13²=169→7", "9: 3²=9, 6²=36→9, 9²=81→9", "2, 3, 5, 6, 8 are impossible"], answer: "0, 1, 4, 7, 9" },
        ],
        questions: [
          { id: "dr-4-q1", text: "Can 210 be a perfect square?", options: ["Yes", "No"], correctIndex: 1, explanation: "DR(210)=3. 3 is not in {0,1,4,7,9}. No perfect square has DR 3." },
        ],
        commonTraps: ["Assuming digital root passes means the answer is correct (it only catches errors, doesn't prove correctness)", "Not recognizing that 0 mod 9 maps to DR=9 for non-zero numbers"],
        speedTips: ["Memorize the impossible DRs for squares: 2, 3, 5, 6, 8", "For cubes, all digital roots 0-9 are possible (0, 1, 8, 9 for multiples of 3, 1-8 for others)"],
      },
    },
  },

  // ── FUNDAMENTAL MATH: NUMBER SYSTEM FACTORS ──────────────
  "number-system-factors": {
    id: "number-system-factors",
    subjectId: "fundamental-math",
    topicPath: ["number-system", "factors"],
    name: "Number System — Factors",
    quickReference: {
      formula: "If N = p^a × q^b × r^c, then factors count = (a+1)(b+1)(c+1)",
      keyIdea: "Every integer can be uniquely expressed as a product of prime powers. The exponent+1 rule gives the count of all positive factors.",
      shortcut: "Sum of factors = (p^(a+1)-1)/(p-1) × (q^(b+1)-1)/(q-1) × ...",
      commonMistake: "Counting only prime factors instead of all factors; confusing exponent from power",
    },
    levels: {
      1: {
        level: 1,
        title: "Counting Factors (Simple)",
        explanation: "To find the number of factors of a number, first prime factorize it. Then add 1 to each exponent and multiply the results. This counts every positive divisor.",
        examples: [
          { problem: "Find the number of factors of 36", steps: ["Prime factorization: 36 = 2² × 3²", "Exponents: 2 (for 2) and 2 (for 3)", "Add 1 to each: (2+1)(2+1) = 3 × 3", "Number of factors: 9"], answer: "9" },
          { problem: "Find the number of factors of 48", steps: ["Prime factorization: 48 = 2⁴ × 3¹", "Exponents: 4 and 1", "(4+1)(1+1) = 5 × 2 = 10", "Number of factors: 10"], answer: "10" },
        ],
        questions: [
          { id: "nsf-1-q1", text: "How many factors does 60 have?", options: ["12", "10", "14", "8"], correctIndex: 0, explanation: "60 = 2²×3×5. (2+1)(1+1)(1+1) = 3×2×2 = 12" },
          { id: "nsf-1-q2", text: "How many factors does 72 have?", options: ["12", "14", "10", "16"], correctIndex: 0, explanation: "72 = 2³×3². (3+1)(2+1) = 4×3 = 12" },
        ],
        commonTraps: ["Counting prime factors only (2, 3, 5) instead of all 12 factors of 60", "Forgetting to add 1 to each exponent"],
        speedTips: ["Learn the factor counts of common numbers: 12 has 6, 24 has 8, 36 has 9, 48 has 10, 60 has 12", "If the exponent is 1, (1+1)=2, so that prime doubles the factor count"],
      },
      2: {
        level: 2,
        title: "Sum of Factors",
        explanation: "The sum of all factors of N = p^a × q^b is: (p⁰ + p¹ + ... + p^a) × (q⁰ + q¹ + ... + q^b). This equals (p^(a+1)-1)/(p-1) × (q^(b+1)-1)/(q-1).",
        examples: [
          { problem: "Sum of factors of 18", steps: ["18 = 2 × 3²", "Sum for 2: (2²-1)/(2-1) = 3/1 = 3", "Sum for 3²: (3³-1)/(3-1) = 26/2 = 13", "Total: 3 × 13 = 39", "Verify: factors are 1,2,3,6,9,18 → sum = 39"], answer: "39" },
          { problem: "Sum of factors of 20", steps: ["20 = 2² × 5", "Sum for 2²: (2³-1)/(2-1) = 7", "Sum for 5: (5²-1)/(5-1) = 24/4 = 6", "Total: 7 × 6 = 42"], answer: "42" },
        ],
        questions: [
          { id: "nsf-2-q1", text: "Sum of factors of 12?", options: ["28", "24", "32", "26"], correctIndex: 0, explanation: "12=2²×3. (2³-1)/(2-1)=7. (3²-1)/(3-1)=8/2=4. 7×4=28" },
        ],
        commonTraps: ["Forgetting that the formula sums every factor, not just the prime factors", "Miscounting the geometric series formula"],
        speedTips: ["For prime numbers, the sum of factors is always p+1 (since factors are 1 and p)", "For squares of primes p², sum = 1 + p + p²"],
      },
      3: {
        level: 3,
        title: "Product of Factors",
        explanation: "The product of all factors of N is N^(number_of_factors/2). This works because factors pair up: each factor f pairs with N/f, and their product is N.",
        examples: [
          { problem: "Product of factors of 12", steps: ["Factors of 12: 1,2,3,4,6,12 (6 factors)", "Product = 12^(6/2) = 12³ = 1728", "Verify: 1×2×3×4×6×12 = 1728"], answer: "1728" },
          { problem: "Product of factors of 36", steps: ["36 has 9 factors", "Product = 36^(9/2) = 36^4.5 = 6^9 (since 36=6²)", "= 10077696"], answer: "10077696" },
        ],
        questions: [
          { id: "nsf-3-q1", text: "Product of factors of 9?", options: ["27", "9", "81", "729"], correctIndex: 0, explanation: "Factors: 1,3,9 (3 factors). Product = 9^(3/2) = 9^1.5 = 27" },
        ],
        commonTraps: ["Using wrong exponent formula (not N^(f/2))", "Incorrectly counting the number of factors first"],
        speedTips: ["Product = N^(f/2). For perfect squares, f is odd, giving a clean result.", "This is rarely asked alone but useful in combination problems"],
      },
      4: {
        level: 4,
        title: "Number of Even/Odd Factors",
        explanation: "Even factors must include at least one factor of 2. Total — odd factors = even factors. Odd factors come from the odd part of the factorization (ignore the 2's exponent).",
        examples: [
          { problem: "Even factors of 72", steps: ["72 = 2³ × 3²", "Total factors: (3+1)(2+1) = 12", "Odd factors come from 3² only: (2+1) = 3", "Even factors: 12 - 3 = 9"], answer: "9" },
          { problem: "Factors of 48 that are multiples of 4", steps: ["48 = 2⁴ × 3", "For multiple of 4 (2²), need 2² minimum", "Exponent choices for 2: 2,3,4 (3 choices)", "Exponent choices for 3: 0,1 (2 choices)", "Total: 3 × 2 = 6"], answer: "6" },
        ],
        questions: [
          { id: "nsf-4-q1", text: "How many odd factors does 100 have?", options: ["3", "4", "5", "6"], correctIndex: 0, explanation: "100=2²×5². Odd part: 5². Factors: (2+1)=3. Odd factors: 1,5,25." },
        ],
        commonTraps: ["Forgetting that 1 is always an odd factor", "Including 2⁰ as part of odd factor count (2⁰=1 is odd, but it's already counted in odd part)"],
        speedTips: ["Odd factors come from only the odd prime powers", "Even factors = total - odd. Factors divisible by a power = restrict the minimum exponent"],
      },
      5: {
        level: 5,
        title: "Co-Prime Factors",
        explanation: "Two numbers are co-prime if their GCD is 1. The count of numbers less than N that are co-prime to N is Euler's totient φ(N) = N × Π(1 - 1/p) for each distinct prime p dividing N.",
        examples: [
          { problem: "φ(12) — numbers less than 12 that are co-prime to 12", steps: ["12 = 2² × 3", "φ(12) = 12 × (1-1/2) × (1-1/3)", "= 12 × 1/2 × 2/3", "= 12 × 2/6 = 4", "Verify: 1,5,7,11 — yes, 4 numbers"], answer: "4" },
          { problem: "φ(30)", steps: ["30 = 2×3×5", "φ(30) = 30 × 1/2 × 2/3 × 4/5", "= 30 × 8/30 = 8", "Verify: 1,7,11,13,17,19,23,29 — 8 numbers"], answer: "8" },
        ],
        questions: [
          { id: "nsf-5-q1", text: "How many numbers less than 20 are co-prime to 20?", options: ["8", "6", "10", "12"], correctIndex: 0, explanation: "20=2²×5. φ(20)=20×(1-1/2)×(1-1/5)=20×1/2×4/5=8" },
        ],
        commonTraps: ["Using p² instead of p for distinct primes in the formula", "Forgetting to include 1 (1 is always co-prime to every number)"],
        speedTips: ["φ(p) = p-1 for prime p", "φ(p^k) = p^k - p^(k-1) = p^k(1-1/p)", "φ(mn) = φ(m)×φ(n) when m and n are co-prime"],
      },
    },
  },

  // ── FUNDAMENTAL MATH: LCM & GCD ──────────────────────────
  "lcm-gcd": {
    id: "lcm-gcd",
    subjectId: "fundamental-math",
    topicPath: ["number-system", "factors"],
    name: "LCM & GCD",
    quickReference: {
      formula: "LCM(a,b) × GCD(a,b) = a × b",
      keyIdea: "GCD is the largest number dividing both. LCM is the smallest number divisible by both. Product of GCD and LCM equals product of the numbers.",
      shortcut: "For prime numbers, GCD = 1 and LCM = a×b. For numbers sharing factors, GCD is the overlap, LCM is the union with overlap counted once.",
      commonMistake: "Confusing LCM with GCD; forgetting that GCD ≤ min(a,b) and LCM ≥ max(a,b)",
    },
    levels: {
      1: {
        level: 1,
        title: "Basic GCD by Listing",
        explanation: "GCD (Greatest Common Divisor) is the largest number that divides both numbers evenly. The simplest method is to list all factors of each number and pick the largest common one.",
        examples: [
          { problem: "GCD of 12 and 18", steps: ["Factors of 12: 1,2,3,4,6,12", "Factors of 18: 1,2,3,6,9,18", "Common: 1,2,3,6", "GCD = 6"], answer: "6" },
          { problem: "GCD of 24 and 36", steps: ["Factors of 24: 1,2,3,4,6,8,12,24", "Factors of 36: 1,2,3,4,6,9,12,18,36", "Common: 1,2,3,4,6,12", "GCD = 12"], answer: "12" },
        ],
        questions: [
          { id: "lcm-1-q1", text: "GCD of 16 and 24?", options: ["4", "6", "8", "12"], correctIndex: 2, explanation: "Factors of 16: 1,2,4,8,16. Factors of 24: 1,2,3,4,6,8,12,24. Common: 1,2,4,8. GCD=8" },
          { id: "lcm-1-q2", text: "GCD of 9 and 15?", options: ["1", "3", "5", "9"], correctIndex: 1, explanation: "Factors of 9: 1,3,9. Factors of 15: 1,3,5,15. GCD=3" },
        ],
        commonTraps: ["Picking the smaller number as GCD without checking if it actually divides both", "Including common factors that don't divide both numbers"],
        speedTips: ["If one number divides the other, the GCD is the smaller number", "GCD of two consecutive integers is always 1"],
      },
      2: {
        level: 2,
        title: "GCD by Prime Factorization",
        explanation: "Prime factorize both numbers, then take the product of common prime powers with the minimum exponent. This works for any pair of numbers.",
        examples: [
          { problem: "GCD of 72 and 108", steps: ["72 = 2³ × 3²", "108 = 2² × 3³", "Common: 2² and 3²", "GCD = 2² × 3² = 4 × 9 = 36"], answer: "36" },
          { problem: "GCD of 45 and 75", steps: ["45 = 3² × 5", "75 = 3 × 5²", "Common: 3¹ and 5¹", "GCD = 3 × 5 = 15"], answer: "15" },
        ],
        questions: [
          { id: "lcm-2-q1", text: "GCD of 48 and 60?", options: ["6", "8", "10", "12"], correctIndex: 3, explanation: "48=2⁴×3, 60=2²×3×5. Common: 2²×3=12" },
        ],
        commonTraps: ["Taking the larger exponent instead of the smaller one", "Forgetting to include all common prime factors"],
        speedTips: ["Use prime factorization for large numbers or when listing factors becomes impractical", "GCD of powers: GCD(a^m, a^n) = a^min(m,n)"],
      },
      3: {
        level: 3,
        title: "Basic LCM by Listing",
        explanation: "LCM (Least Common Multiple) is the smallest number that is a multiple of both numbers. The simplest method is to list multiples and pick the smallest common one.",
        examples: [
          { problem: "LCM of 6 and 8", steps: ["Multiples of 6: 6,12,18,24,30,36,...", "Multiples of 8: 8,16,24,32,40,...", "Common: 24, 48, ...", "LCM = 24"], answer: "24" },
          { problem: "LCM of 4 and 10", steps: ["Multiples of 4: 4,8,12,16,20,24,...", "Multiples of 10: 10,20,30,40,...", "LCM = 20"], answer: "20" },
        ],
        questions: [
          { id: "lcm-3-q1", text: "LCM of 6 and 9?", options: ["15", "18", "21", "36"], correctIndex: 1, explanation: "Multiples of 6: 6,12,18,24. Multiples of 9: 9,18,27. LCM=18" },
        ],
        commonTraps: ["Giving the product a×b instead of the actual LCM", "Missing a smaller common multiple before the product"],
        speedTips: ["If one number is a multiple of the other, the LCM is the larger number", "LCM of two prime numbers is their product"],
      },
      4: {
        level: 4,
        title: "LCM by Prime Factorization",
        explanation: "Prime factorize both numbers, then take the product of all prime powers with the maximum exponent. This is the most reliable LCM method.",
        examples: [
          { problem: "LCM of 72 and 108", steps: ["72 = 2³ × 3²", "108 = 2² × 3³", "Max: 2³ and 3³", "LCM = 2³ × 3³ = 8 × 27 = 216"], answer: "216" },
          { problem: "LCM of 45 and 75", steps: ["45 = 3² × 5", "75 = 3 × 5²", "Max: 3² and 5²", "LCM = 9 × 25 = 225"], answer: "225" },
        ],
        questions: [
          { id: "lcm-4-q1", text: "LCM of 48 and 60?", options: ["120", "180", "240", "360"], correctIndex: 2, explanation: "48=2⁴×3, 60=2²×3×5. Max: 2⁴×3×5=16×15=240" },
        ],
        commonTraps: ["Taking the minimum exponent (that's GCD) instead of the maximum", "Forgetting that LCM ≥ max(a,b) always"],
        speedTips: ["LCM(a,b) = a×b / GCD(a,b) — the fastest method once you know the GCD", "For any two numbers, a × b = LCM(a,b) × GCD(a,b)"],
      },
      5: {
        level: 5,
        title: "LCM & GCD Applications",
        explanation: "Many competitive exam problems involve LCM and GCD in real-world contexts — finding the next time events coincide, splitting items into equal groups, or finding numbers with given LCM and GCD.",
        examples: [
          { problem: "Two bells ring at intervals of 8 and 12 minutes. When will they ring together again?", steps: ["Need LCM of 8 and 12", "8 = 2³, 12 = 2² × 3", "LCM = 2³ × 3 = 24", "They ring together every 24 minutes"], answer: "24 minutes" },
          { problem: "Find two numbers with GCD=6 and LCM=180", steps: ["Let numbers be 6a and 6b where a,b are co-prime", "LCM = 6ab = 180, so ab = 30", "Co-prime pairs: (1,30), (2,15), (3,10), (5,6)", "Numbers: (6,180), (12,90), (18,60), (30,36)"], answer: "(6,180), (12,90), (18,60), (30,36)" },
        ],
        questions: [
          { id: "lcm-5-q1", text: "Three lights flash at intervals of 4, 6, and 9 seconds. When will they flash together?", options: ["24s", "36s", "48s", "72s"], correctIndex: 1, explanation: "LCM of 4,6,9: 4=2², 6=2×3, 9=3². LCM=2²×3²=36s" },
        ],
        commonTraps: ["Adding intervals instead of finding LCM", "Forgetting that the answer must be a multiple of all given numbers"],
        speedTips: ["For word problems, 'again together', 'simultaneously', 'meet again' indicate LCM", "For splitting/grouping problems, GCD tells the largest possible group size"],
      },
    },
  },

  // ── FUNDAMENTAL MATH: PRIME FACTORIZATION ────────────────
  "prime-factorization": {
    id: "prime-factorization",
    subjectId: "fundamental-math",
    topicPath: ["number-system", "prime"],
    name: "Prime Factorization",
    quickReference: {
      formula: "Every integer > 1 is a unique product of primes in non-decreasing order",
      keyIdea: "Divide by the smallest prime factor repeatedly until the quotient is 1",
      shortcut: "Use divisibility rules to skip trial division: 2, 3, 5, 7, 11 order",
      commonMistake: "Missing a repeated prime factor (e.g., factoring 12 as 2×6 instead of 2²×3)",
    },
    levels: {
      1: {
        level: 1,
        title: "Division by Small Primes",
        explanation: "Start dividing by 2 (the smallest prime), then 3, then 5, then 7, etc. Keep dividing by each prime until it no longer divides evenly, then move to the next prime. Stop when the quotient is 1.",
        examples: [
          { problem: "Factor 84", steps: ["84 ÷ 2 = 42", "42 ÷ 2 = 21", "21 ÷ 3 = 7", "7 ÷ 7 = 1", "84 = 2² × 3 × 7"], answer: "2² × 3 × 7" },
          { problem: "Factor 90", steps: ["90 ÷ 2 = 45", "45 ÷ 3 = 15", "15 ÷ 3 = 5", "5 ÷ 5 = 1", "90 = 2 × 3² × 5"], answer: "2 × 3² × 5" },
        ],
        questions: [
          { id: "pf-1-q1", text: "Prime factorization of 72?", options: ["2³×3²", "2²×3³", "2⁴×3²", "2³×3³"], correctIndex: 0, explanation: "72÷2=36,÷2=18,÷2=9,÷3=3,÷3=1. 72=2³×3²" },
        ],
        commonTraps: ["Missing a prime by skipping one (e.g., 4 when 2² is correct)", "Stopping before reaching 1"],
        speedTips: ["Start with 2 (most common prime factor), then 3, 5, 7", "If the number is even, start by halving repeatedly"],
      },
      2: {
        level: 2,
        title: "Factor Tree Method",
        explanation: "Draw a factor tree: split the number into any two factors, then split each factor until all leaves are primes. Collect all primes at the leaves.",
        examples: [
          { problem: "Factor 120 using a tree", steps: ["120 = 12 × 10", "12 = 4 × 3 = 2² × 3", "10 = 2 × 5", "Collect: 2³ × 3 × 5"], answer: "2³ × 3 × 5" },
          { problem: "Factor 126", steps: ["126 = 2 × 63", "63 = 7 × 9 = 7 × 3²", "126 = 2 × 3² × 7"], answer: "2 × 3² × 7" },
        ],
        questions: [
          { id: "pf-2-q1", text: "Prime factorization of 180?", options: ["2²×3²×5", "2³×3²×5", "2²×3³×5", "2²×3²×7"], correctIndex: 0, explanation: "180 = 2² × 3² × 5" },
        ],
        commonTraps: ["Drawing a tree that doesn't fully decompose to primes (stopping at composite leaves)", "Double-counting a prime factor in the collection step"],
        speedTips: ["Split into an even × odd pair first to isolate the 2s", "Use divisibility rules: sum of digits for 3, last digit for 2 and 5"],
      },
      3: {
        level: 3,
        title: "Large Number Factoring",
        explanation: "For larger numbers, use systematic trial division up to √N. If no prime factor up to √N divides N, then N itself is prime. This is the key theorem of primality testing.",
        examples: [
          { problem: "Is 97 prime?", steps: ["Check up to √97 ≈ 9.8", "97 mod 2 = 1, mod 3 = 1, mod 5 = 2, mod 7 = 6", "No prime ≤ 7 divides 97", "97 is prime"], answer: "Prime" },
          { problem: "Factor 221", steps: ["221 ÷ 2 ≠, ÷ 3 ≠, ÷ 5 ≠", "221 ÷ 7 = 31.57...", "221 ÷ 11 = 20.09...", "221 ÷ 13 = 17 exactly", "221 = 13 × 17"], answer: "13 × 17" },
        ],
        questions: [
          { id: "pf-3-q1", text: "Is 143 prime?", options: ["Yes", "No (11×13)"], correctIndex: 1, explanation: "143 ÷ 11 = 13. 143 = 11 × 13, not prime." },
        ],
        commonTraps: ["Checking beyond √N unnecessarily", "Not checking all primes up to √N before concluding primality"],
        speedTips: ["Memorize primes up to 50 for quick trial division", "The gap between √N and N/2 is the most efficient trial range"],
      },
      4: {
        level: 4,
        title: "Applications in GCD/LCM",
        explanation: "Prime factorization gives GCD and LCM directly: GCD takes the minimum exponent for each prime, LCM takes the maximum exponent. This is the conceptual foundation for all GCD/LCM problems.",
        examples: [
          { problem: "Find LCM of 48 and 60", steps: ["48 = 2⁴ × 3", "60 = 2² × 3 × 5", "LCM: max exponents → 2⁴ × 3 × 5 = 240"], answer: "240" },
          { problem: "Find GCD of 84 and 108", steps: ["84 = 2² × 3 × 7", "108 = 2² × 3³", "GCD: min exponents → 2² × 3 = 12"], answer: "12" },
        ],
        questions: [
          { id: "pf-4-q1", text: "GCD of 72 and 90?", options: ["18", "12", "24", "36"], correctIndex: 0, explanation: "72=2³×3², 90=2×3²×5. GCD: 2×3²=18" },
        ],
        commonTraps: ["Confusing GCD (min exponents) with LCM (max exponents)", "Forgetting to include primes that appear in only one factorization"],
        speedTips: ["GCD × LCM = product of the two numbers (for exactly 2 numbers)", "Euclidean algorithm is faster for large numbers, but prime factorization gives more insight"],
      },
    },
  },

  // ── GMAT: WORK RATE ──────────────────────────────────────
  "work-rate": {
    id: "work-rate",
    subjectId: "gmat",
    topicPath: ["quantitative", "work-rate"],
    name: "Work Rate",
    quickReference: {
      formula: "R × T = W (Rate × Time = Work), 1/T₁ + 1/T₂ = 1/T_combined",
      keyIdea: "Convert individual times to rates (jobs per hour), add rates for combined work, invert back to time",
      shortcut: "For two workers: T_combined = (T₁ × T₂) / (T₁ + T₂)",
      commonMistake: "Adding times instead of rates (1/6 + 1/3 = 1/2, not 6+3=9)",
    },
    levels: {
      1: {
        level: 1,
        title: "Single Worker",
        explanation: "If one worker completes a job in T hours, their rate is 1/T jobs per hour. In t hours, they complete t/T of the job. This is the foundation of all work-rate problems.",
        examples: [
          { problem: "Alice paints a room in 6 hours. How much does she paint in 2 hours?", steps: ["Rate: 1/6 room per hour", "In 2 hours: 2 × 1/6 = 2/6 = 1/3", "She paints 1/3 of the room"], answer: "1/3" },
          { problem: "Bob can write 12 reports in 4 hours. What's his rate per hour?", steps: ["Rate = Work / Time = 12/4 = 3", "Bob writes 3 reports per hour"], answer: "3 reports/hour" },
        ],
        questions: [
          { id: "wr-1-q1", text: "Charlie completes a task in 8 hours. What fraction remains after 3 hours?", options: ["5/8", "3/8", "1/8", "5/5"], correctIndex: 0, explanation: "Rate: 1/8. In 3 hours: 3/8 done. Remaining: 1 - 3/8 = 5/8" },
        ],
        commonTraps: ["Forgetting to express the rate as a fraction of the whole job", "Mixing up done vs. remaining"],
        speedTips: ["Rate = 1/Time is the key mental model", "Work done = elapsed time / total time"],
      },
      2: {
        level: 2,
        title: "Two Workers Together",
        explanation: "Add the individual rates to get the combined rate. Then invert to find the combined time. The shortcut T₁T₂/(T₁+T₂) works for exactly two workers doing the same job.",
        examples: [
          { problem: "Alice (6h) and Bob (3h) together — how long?", steps: ["Alice: 1/6 room/h, Bob: 1/3 room/h", "Combined: 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2", "Time = 1 ÷ (1/2) = 2 hours", "Shortcut: (6×3)/(6+3) = 18/9 = 2"], answer: "2 hours" },
          { problem: "Pipe A fills tank in 4h, Pipe B in 6h. Together?", steps: ["A: 1/4, B: 1/6, Combined: 5/12", "Time = 12/5 = 2.4 hours = 2h 24min"], answer: "2.4 hours" },
        ],
        questions: [
          { id: "wr-2-q1", text: "Jen (5h) and Ken (7h) working together — how many hours?", options: ["35/12", "12/35", "6", "35"], correctIndex: 0, explanation: "(5×7)/(5+7) = 35/12 ≈ 2.92 hours" },
        ],
        commonTraps: ["Adding times and dividing by 2 (wrong for differently sized workers)", "Forgetting to convert hours to minutes when fractional"],
        speedTips: ["The shortcut T₁T₂/(T₁+T₂) is faster than adding fractions", "When workers take equal time, combined time is half: T/2"],
      },
      3: {
        level: 3,
        title: "One Worker Joins Late",
        explanation: "When the second worker starts later, calculate the work done by the first worker alone, then add the combined rate for the remaining time. Set up as: (rate₁ × t) + (combined rate × remaining time) = 1.",
        examples: [
          { problem: "Alice starts alone, Bob joins after 1 hour. Total time?", steps: ["Alice: 1/6 per hour. First hour: 1/6 done", "Remaining: 5/6 of room", "Combined rate: 1/2 room/h", "Time together: (5/6) ÷ (1/2) = 5/3 = 1h 40min", "Total: 2h 40min"], answer: "2h 40min" },
        ],
        questions: [
          { id: "wr-3-q1", text: "Pipe A (4h) alone for 30 min, then B (6h) joins. Total fill time?", options: ["2.7h", "3h", "2.5h", "3.2h"], correctIndex: 0, explanation: "A: 1/4. 30min: 1/8. Remaining: 7/8. Combined: 5/12. Time: (7/8)/(5/12)=2.1h. Total: 2.6h ≈ 2.7h" },
        ],
        commonTraps: ["Forgetting to account for the work already done before the second worker joins", "Using combined rate for the entire duration"],
        speedTips: ["Break into two phases: 'before joined' and 'after joined'", "Convert everything to fractions of the job to avoid decimals"],
      },
      4: {
        level: 4,
        title: "Multiple Workers with Different Rates",
        explanation: "For three or more workers, the principle is the same: sum all individual rates. The combined time is 1 divided by the sum of rates. Workers can also have opposing effects (one filling, one draining).",
        examples: [
          { problem: "Three pipes: A fills in 3h, B in 4h, C in 6h. Together?", steps: ["Rates: 1/3 + 1/4 + 1/6 = 4/12 + 3/12 + 2/12 = 9/12 = 3/4", "Time: 1 ÷ (3/4) = 4/3 = 1.333h = 1h 20min"], answer: "1h 20min" },
          { problem: "Fills in 4h, drains in 6h. Net fill time?", steps: ["Fill: +1/4, Drain: -1/6", "Net: 1/4 - 1/6 = 3/12 - 2/12 = 1/12", "Time: 12 hours to fill"], answer: "12 hours" },
        ],
        questions: [
          { id: "wr-4-q1", text: "Pump fills in 5h, drain empties in 8h. Net fill time?", options: ["13.33h", "3.08h", "40h", "20h"], correctIndex: 0, explanation: "1/5 - 1/8 = 3/40. Time = 40/3 ≈ 13.33 hours" },
        ],
        commonTraps: ["Adding a draining rate as positive instead of negative", "Forgetting to find the least common denominator when summing fractions"],
        speedTips: ["Think of draining rates as negative work rates", "For 3+ workers, use LCM for the common denominator"],
      },
      5: {
        level: 5,
        title: "Work with Efficiency Changes",
        explanation: "When workers have different efficiencies or efficiency changes mid-task, represent each worker's contribution as a percentage or fraction of the total work. Set up equations with variables and solve.",
        examples: [
          { problem: "A is 50% more efficient than B. Together they finish in 8h. How long for A alone?", steps: ["Let B's rate = r. Then A's rate = 1.5r", "Combined: r + 1.5r = 2.5r = 1/8", "r = 1/20. A's rate = 1.5/20 = 3/40", "A alone: 40/3 = 13.33 hours"], answer: "13.33 hours" },
          { problem: "A works twice as fast as B. Together 6h. B alone?", steps: ["Let B's rate = r. A's rate = 2r", "Combined: 3r = 1/6, so r = 1/18", "B alone: 18 hours"], answer: "18 hours" },
        ],
        questions: [
          { id: "wr-5-q1", text: "A is 25% faster than B. Together 10h. A alone time?", options: ["18h", "22.5h", "15h", "20h"], correctIndex: 0, explanation: "Let B=r, A=1.25r. Combined: 2.25r=1/10, r=1/22.5. A=1.25/22.5=1/18. A alone: 18h" },
        ],
        commonTraps: ["Misinterpreting '50% more efficient' — it's +50% of the rate, not the time", "Forgetting that faster = shorter time, so the inverse relationship must hold"],
        speedTips: ["Convert 'x% more efficient' to a rate multiplier: 1 + x/100", "Always verify: combined time < each individual time"],
      },
    },
  },

  // ── GMAT: SPEED & DISTANCE ───────────────────────────────
  "speed-distance": {
    id: "speed-distance",
    subjectId: "gmat",
    topicPath: ["quantitative", "speed-distance"],
    name: "Speed & Distance",
    quickReference: {
      formula: "D = S × T (Distance = Speed × Time)",
      keyIdea: "Units must match: if speed is km/h, time must be in hours and distance in km",
      shortcut: "For equal distances at different speeds, average speed = 2ab/(a+b)",
      commonMistake: "Using arithmetic mean of speeds instead of harmonic mean for equal distances",
    },
    levels: {
      1: {
        level: 1,
        title: "Basic DST",
        explanation: "The core relationship D = S × T. Given any two, find the third. Always check units — convert minutes to hours (divide by 60) and seconds to hours (divide by 3600).",
        examples: [
          { problem: "Car travels 240 km at 60 km/h. Time?", steps: ["T = D/S = 240/60 = 4 hours"], answer: "4 hours" },
          { problem: "Train travels for 3 hours at 80 km/h. Distance?", steps: ["D = S × T = 80 × 3 = 240 km"], answer: "240 km" },
        ],
        questions: [
          { id: "sd-1-q1", text: "Cyclist travels 15 km at 10 km/h. Time in minutes?", options: ["90", "60", "75", "120"], correctIndex: 0, explanation: "T=15/10=1.5h=90 minutes" },
        ],
        commonTraps: ["Forgetting to convert minutes to hours", "Mixing km/h with meters/second"],
        speedTips: ["Memorize: 60 km/h = 1 km/min. At 60 km/h, distance in km = minutes traveled.", "For m/s to km/h, multiply by 18/5 (or 3.6)"],
      },
      2: {
        level: 2,
        title: "Relative Speed",
        explanation: "When two objects move toward each other, relative speed = sum of speeds. Time to meet = initial distance ÷ relative speed. For same direction, relative speed = difference of speeds.",
        examples: [
          { problem: "Two cars toward each other from 300 km apart at 50 km/h and 70 km/h. Meeting time?", steps: ["Relative speed: 50 + 70 = 120 km/h", "Time = 300/120 = 2.5 hours"], answer: "2.5 hours" },
          { problem: "Car chasing another from 50 km behind at +20 km/h faster. Time to catch?", steps: ["Relative speed: 20 km/h", "Time = 50/20 = 2.5 hours"], answer: "2.5 hours" },
        ],
        questions: [
          { id: "sd-2-q1", text: "Two trains 400 km apart approach at 60 and 40 km/h. Meeting time?", options: ["4h", "5h", "3h", "6h"], correctIndex: 0, explanation: "Relative: 60+40=100 km/h. Time: 400/100=4h" },
        ],
        commonTraps: ["Adding speeds for same-direction problems instead of subtracting", "Using distance that doesn't account for both objects' movement"],
        speedTips: ["Toward each other: add speeds. Same direction: subtract speeds.", "The time to meet is always ≤ the time for the faster to cover the gap alone"],
      },
      3: {
        level: 3,
        title: "Average Speed",
        explanation: "Average speed is NOT the arithmetic mean of speeds. It's total distance ÷ total time. For equal distances at speeds a and b, average speed = 2ab/(a+b) (harmonic mean).",
        examples: [
          { problem: "Half the trip at 40 km/h, half at 60 km/h. Average speed?", steps: ["Equal distances? 'Half the trip' means half the distance", "Use harmonic mean: 2×40×60/(40+60) = 4800/100 = 48 km/h", "Verification: d/40 + d/60 = (3d+2d)/120 = 5d/120. V_avg = 2d/(5d/120) = 48"], answer: "48 km/h" },
          { problem: "1 hour at 40 km/h, 1 hour at 60 km/h. Average speed?", steps: ["Equal times, not distances: arithmetic mean applies", "Average = (40+60)/2 = 50 km/h", "Verification: total distance = 100 km, total time = 2h, V_avg = 50 km/h"], answer: "50 km/h" },
        ],
        questions: [
          { id: "sd-3-q1", text: "Equal distances at 30 km/h and 50 km/h. Average speed?", options: ["37.5", "40", "42.5", "35"], correctIndex: 0, explanation: "Harmonic mean: 2×30×50/(30+50) = 3000/80 = 37.5 km/h" },
        ],
        commonTraps: ["Using arithmetic mean for equal-distance problems", "Forgetting to verify whether 'half' refers to distance or time"],
        speedTips: ["Equal distances → harmonic mean. Equal times → arithmetic mean.", "If the problem says 'half the time at speed a' → arithmetic mean. 'Half the distance' → harmonic."],
      },
      4: {
        level: 4,
        title: "Boats & Streams",
        explanation: "Downstream speed = boat speed + stream speed. Upstream speed = boat speed - stream speed. Average speed for a round trip (up and down same distance) = 2ab/(a+b) where a and b are the two speeds.",
        examples: [
          { problem: "Boat speed 15 km/h, stream 3 km/h. Downstream speed? Upstream?", steps: ["Down: 15 + 3 = 18 km/h", "Up: 15 - 3 = 12 km/h"], answer: "18 km/h, 12 km/h" },
          { problem: "Round trip across 36 km river with above speeds. Total time?", steps: ["Down: 36/18 = 2h", "Up: 36/12 = 3h", "Total: 5h"], answer: "5 hours" },
        ],
        questions: [
          { id: "sd-4-q1", text: "Still water speed 12 km/h, stream 4 km/h. Time for 32 km downstream?", options: ["2h", "4h", "3h", "2.5h"], correctIndex: 0, explanation: "Down: 12+4=16 km/h. Time: 32/16=2h" },
        ],
        commonTraps: ["Forgetting to add/subtract stream speed to/from boat speed", "Using still water speed as the effective speed in both directions"],
        speedTips: ["Down + Up speeds = 2 × boat speed. Down - Up speeds = 2 × stream speed.", "The boat speed is the average of downstream and upstream speeds."],
      },
    },
  },

  // ── GMAT: DATA SUFFICIENCY STRATEGY ──────────────────────
  "data-sufficiency": {
    id: "data-sufficiency",
    subjectId: "gmat",
    topicPath: ["ds", "ds-strategy"],
    name: "Data Sufficiency Strategy",
    quickReference: {
      formula: "Evaluate (1) alone, then (2) alone. If neither, try (1)+(2) together. Never assume statements are sufficient.",
      keyIdea: "You don't need the exact answer — just determine if the data is ENOUGH to answer uniquely",
      shortcut: "AD/BCE grid: Start with (1). If sufficient, eliminate B/C/E; if not, eliminate A/D. Then evaluate (2).",
      commonMistake: "Selecting C when (1) and (2) individually give the same information (C requires each alone to be insufficient but together sufficient)",
    },
    levels: {
      1: {
        level: 1,
        title: "Yes/No Questions",
        explanation: "For yes/no DS questions, a statement is sufficient if it gives a definitive YES or definitive NO. If the answer could be either, the statement is insufficient. One definitive answer is enough.",
        examples: [
          { problem: "Is x > 5? (1) x = 7 (2) x² = 36", steps: ["(1) x=7 → YES, sufficient. Eliminate B,C,E.", "(2) x=6 or x=-6 → NO (x=-6) or YES (x=6). Not sufficient.", "Answer: A (Statement 1 alone)"], answer: "A" },
          { problem: "Is x even? (1) x is divisible by 4 (2) x² is even", steps: ["(1) divisible by 4 → even. YES, sufficient.", "(2) x² even → x even. YES, sufficient.", "Answer: D (Each alone sufficient)"], answer: "D" },
        ],
        questions: [
          { id: "ds-1-q1", text: "Is x positive? (1) x > -1 (2) x > 0", options: ["A", "B", "C", "D", "E"], correctIndex: 1, explanation: "(1) x > -1: x=0 (no), x=2 (yes). Insufficient. (2) x > 0: always yes. Sufficient. Answer: B" },
        ],
        commonTraps: ["Assuming a statement is insufficient because it gives a 'NO' answer — NO is a valid definitive answer", "Forgetting that statements must be evaluated independently"],
        speedTips: ["A definitive NO is just as sufficient as a definitive YES", "If a statement gives both YES and NO possibilities, it's insufficient"],
      },
      2: {
        level: 2,
        title: "Value Questions",
        explanation: "For value DS questions, a statement must give EXACTLY ONE possible value. If a statement allows multiple values, it's insufficient. The fact that you can solve an equation doesn't mean the value is unique.",
        examples: [
          { problem: "What is x? (1) x² = 25 (2) x > 0", steps: ["(1) x = 5 or -5 → two values. Insufficient.", "(2) x > 0 → infinite values. Insufficient.", "Together: x = 5. Sufficient. Answer: C"], answer: "C" },
          { problem: "What is the perimeter of a square? (1) Side = 5", steps: ["(1) Perimeter = 4×5 = 20. Exactly one value. Sufficient.", "Answer: A"], answer: "A" },
        ],
        questions: [
          { id: "ds-2-q1", text: "What is n? (1) n² = 49 (2) n is odd", options: ["A", "B", "C", "D", "E"], correctIndex: 2, explanation: "(1) n=7 or -7. Insufficient. (2) n could be any odd #. Insufficient. Together: n=7 (only odd). Answer: C" },
        ],
        commonTraps: ["Selecting D when a quadratic gives two possible values", "Forgetting that a single equation with two variables usually has infinite solutions"],
        speedTips: ["Linear equations: 1 equation, 1 variable → unique. 1 equation, 2 variables → infinite.", "Check for hidden constraints (positive integers, etc.) that may reduce possibilities"],
      },
      3: {
        level: 3,
        title: "The AD/BCE Grid",
        explanation: "The standard DS elimination strategy: Evaluate (1). If sufficient → eliminate B, C, E (remaining: A, D). If insufficient → eliminate A, D (remaining: B, C, E). Then evaluate (2). Works for both Yes/No and Value questions.",
        examples: [
          { problem: "Evaluate: (1) sufficient, (2) insufficient", steps: ["(1) sufficient → eliminate B, C, E", "(2) insufficient → eliminate D (was possible with A)", "Remaining: A → Answer is A"], answer: "A" },
          { problem: "Evaluate: (1) insufficient, (2) sufficient", steps: ["(1) insufficient → eliminate A, D", "(2) sufficient → eliminate C, E", "Remaining: B → Answer is B"], answer: "B" },
        ],
        questions: [
          { id: "ds-3-q1", text: "(1) insufficient, (2) insufficient. Together sufficient. Answer?", options: ["A", "B", "C", "D", "E"], correctIndex: 2, explanation: "(1) insufficient → eliminate A,D. (2) insufficient → B,C,E remain. Together sufficient → eliminate E. Answer: C" },
        ],
        commonTraps: ["Choosing E when (1) and (2) together are sufficient", "Choosing C when (1) or (2) alone is sufficient"],
        speedTips: ["Always write AD/BCE on scratch paper before starting", "The most common trap answer is C (when one alone is actually sufficient)"],
      },
    },
  },

  // ── GMAT: SENTENCE CORRECTION PARALLELISM ────────────────
  "sentence-correction-parallelism": {
    id: "sentence-correction-parallelism",
    subjectId: "gmat",
    topicPath: ["sc", "parallelism"],
    name: "Sentence Correction — Parallelism",
    quickReference: {
      formula: "Items in a list or comparison must share the same grammatical form (noun, verb, gerund, infinitive, etc.)",
      keyIdea: "Look for parallelism markers: and, or, but, both...and, either...or, not only...but also",
      shortcut: "Match the form of the first item in the list — all subsequent items should mirror it",
      commonMistake: "Ignoring the first element and matching an intermediate element instead",
    },
    levels: {
      1: {
        level: 1,
        title: "Basic Lists of Verbs",
        explanation: "In a list of actions, all verbs must share the same tense and form. If the first verb is in past tense, all others must also be in past tense. If the first is a gerund, all must be gerunds.",
        examples: [
          { problem: "Fix: 'She likes to run, swim, and cycling.'", steps: ["List: to run, swim, and cycling", "First two are infinitives (to run, [to] swim), third is gerund (cycling)", "Correct: 'She likes to run, swim, and cycle.'", "Or: 'She likes running, swimming, and cycling.'"], answer: "to run, swim, and cycle" },
          { problem: "Fix: 'The company hired, trained, and is promoting employees.'", steps: ["List: hired (past), trained (past), is promoting (present progressive)", "Mixed tenses", "Correct: 'The company hired, trained, and promoted employees.'"], answer: "hired, trained, and promoted" },
        ],
        questions: [
          { id: "sc-p-1-q1", text: "Choose correct: 'He enjoys reading, writing, and ___'", options: ["to paint", "paint", "painting", "painted"], correctIndex: 2, explanation: "List starts with gerunds (reading, writing), so third must also be gerund: painting" },
        ],
        commonTraps: ["Switching from infinitive to gerund mid-list (or vice versa)", "Forgetting the implied 'to' in an infinitive list"],
        speedTips: ["Underline the parallelism marker (and, or, but) and compare what's on both sides", "The first item sets the pattern — check all others against it"],
      },
      2: {
        level: 2,
        title: "Noun Lists",
        explanation: "Nouns in a list must match in form: count vs. non-count, singular vs. plural, and abstract vs. concrete. Mixed categories are ungrammatical.",
        examples: [
          { problem: "Fix: 'The course covers grammar, vocabulary, and how to write.'", steps: ["List: grammar (noun), vocabulary (noun), how to write (clause)", "Mix of nouns and a clause", "Correct: 'The course covers grammar, vocabulary, and writing.'"], answer: "grammar, vocabulary, and writing" },
          { problem: "Fix: 'His responsibilities include drafting reports, client meetings, and to train staff.'", steps: ["List: drafting reports (gerund phrase), client meetings (noun), to train staff (infinitive)", "Three different forms", "Correct: 'drafting reports, attending client meetings, and training staff.'"], answer: "drafting reports, attending client meetings, and training staff" },
        ],
        questions: [
          { id: "sc-p-2-q1", text: "Choose correct: 'Success requires dedication, hard work, and ___'", options: ["to persevere", "perseverance", "persevering", "persevere"], correctIndex: 1, explanation: "List is nouns (dedication, hard work) → perseverance (noun)" },
        ],
        commonTraps: ["Mixing concrete and abstract nouns in a list", "Using a clause where a noun phrase is expected"],
        speedTips: ["If the first item is a noun, all items should be nouns (or noun phrases)", "Replace 'and' with a bullet point list mentally to check form matching"],
      },
      3: {
        level: 3,
        title: "Correlative Conjunctions",
        explanation: "Correlative pairs (both...and, either...or, neither...nor, not only...but also) require the same grammatical form after each element of the pair. The structure after 'both' must match the structure after 'and'.",
        examples: [
          { problem: "Fix: 'She is both intelligent and has charm.'", steps: ["Both [adjective] AND [verb phrase]", "Mismatched forms", "Correct: 'She is both intelligent and charming.' (adjective + adjective)", "Or: 'She both has intelligence and has charm.' (verb phrase + verb phrase)"], answer: "intelligent and charming" },
          { problem: "Fix: 'He not only runs fast but also is a good swimmer.'", steps: ["Not only [verb phrase] but also [noun phrase]", "Correct: 'He not only runs fast but also swims well.'", "Or: 'He is not only a fast runner but also a good swimmer.'"], answer: "not only runs fast but also swims well" },
        ],
        questions: [
          { id: "sc-p-3-q1", text: "Choose correct: 'The movie was neither entertaining ___'", options: ["nor had educational value", "nor educational", "nor was it educational", "or educational"], correctIndex: 1, explanation: "Neither [adjective] nor [adjective]. 'entertaining' → 'educational'." },
        ],
        commonTraps: ["Putting a verb after the first element and a noun after the second", "Forgetting that the pair creates a grammatical lock — both sides must match exactly"],
        speedTips: ["Break correlative pairs into two halves: what's after 'both' must match what's after 'and'", "Read each half independently — if they use different forms, it's wrong"],
      },
      4: {
        level: 4,
        title: "Comparisons",
        explanation: "Comparisons require parallel structure: 'X is more A than B' — A and B must be the same grammatical form. 'I like X more than Y' — X and Y must be structurally parallel (both nouns, both clauses, etc.).",
        examples: [
          { problem: "Fix: 'Running is more effective than to walk for weight loss.'", steps: ["Comparison: Running (gerund) vs. to walk (infinitive)", "Correct: 'Running is more effective than walking for weight loss.'"], answer: "Running...walking" },
          { problem: "Fix: 'The weather in Chicago is colder than Miami.'", steps: ["Comparison: weather in Chicago vs. Miami (city)", "Illogical — comparing weather to a city", "Correct: 'The weather in Chicago is colder than that in Miami.'"], answer: "that in Miami" },
        ],
        questions: [
          { id: "sc-p-4-q1", text: "Choose correct: 'Her dedication to work is as strong as ___'", options: ["her brother", "her brother's", "her brother is", "brother"], correctIndex: 1, explanation: "Dedication vs. dedication: 'her dedication...as strong as her brother's [dedication]'" },
        ],
        commonTraps: ["Comparing a person to a quality (illogical comparison)", "Omitting 'that' or 'those' as a placeholder for the compared noun"],
        speedTips: ["After 'than' or 'as', check that the compared elements are structurally identical", "Add 'that/those' to fix missing noun comparisons: 'X of A is bigger than THAT of B'"],
      },
    },
  },

  // ── GRE: QUANT COMPARISON ────────────────────────────────
  "quant-comparison": {
    id: "quant-comparison",
    subjectId: "gre",
    topicPath: ["quantitative", "quant-comparison"],
    name: "Quant Comparison Strategy",
    quickReference: {
      formula: "Compare A and B. Answer A if A>B, B if B>A, C if equal, D if cannot determine.",
      keyIdea: "You don't need exact values — just determine which is larger, or if a unique comparison is possible",
      shortcut: "Simplify the comparison: subtract common terms, square both sides, or test boundary values",
      commonMistake: "Assuming variables are positive integers when they could be negative, zero, or fractional",
    },
    levels: {
      1: {
        level: 1,
        title: "Numeric Comparisons",
        explanation: "When both quantities are purely numeric, compute both values and compare directly. No tricks — just careful calculation. Watch for fractions, decimals, and exponents.",
        examples: [
          { problem: "A = 64 ÷ 8, B = 2 × 4", steps: ["A = 8, B = 8", "A = B", "Answer: C"], answer: "C" },
          { problem: "A = 1/4 + 1/3, B = 1/2", steps: ["A = 3/12 + 4/12 = 7/12 ≈ 0.583", "B = 0.5", "7/12 > 6/12, so A > B", "Answer: A"], answer: "A" },
        ],
        questions: [
          { id: "qc-1-q1", text: "A = 15% of 200, B = 20% of 150", options: ["A > B", "B > A", "A = B", "Cannot determine"], correctIndex: 2, explanation: "A=30, B=30. A=B. Answer: C" },
        ],
        commonTraps: ["Calculation errors with percentages", "Forgetting to find a common denominator for fractions"],
        speedTips: ["For pure numbers, just compute — there's always a unique answer (A, B, or C)", "Use rounding for quick estimation, then compute precisely to confirm"],
      },
      2: {
        level: 2,
        title: "Variable Comparisons",
        explanation: "When variables are involved, consider different types of numbers: positive, negative, zero, fractions between 0 and 1, and numbers greater than 1. Each can dramatically change the comparison.",
        examples: [
          { problem: "A = x², B = x, where x > 0", steps: ["If x = 2: A = 4, B = 2. A > B", "If x = 0.5: A = 0.25, B = 0.5. A < B", "Different outcomes depending on x", "Answer: D (cannot determine)"], answer: "D" },
          { problem: "A = x + 5, B = x + 3, where x is any real number", steps: ["A - B = (x+5) - (x+3) = 2", "A is always 2 more than B, regardless of x", "Answer: A"], answer: "A" },
        ],
        questions: [
          { id: "qc-2-q1", text: "A = 1/x, B = 1 (x > 1)", options: ["A > B", "B > A", "A = B", "Cannot determine"], correctIndex: 1, explanation: "If x>1, then 1/x < 1. Example: x=2, 1/2=0.5 < 1. B > A always." },
        ],
        commonTraps: ["Testing only one value (usually a positive integer)", "Forgetting that x² could equal x when x=0 or x=1"],
        speedTips: ["Test x=0, x=1, x=2, x=0.5, x=-1 for any variable comparison", "If the difference A-B simplifies to a constant, the answer is never D"],
      },
      3: {
        level: 3,
        title: "Geometric & Algebraic Shortcuts",
        explanation: "Many QC questions can be simplified algebraically before comparing. Square both sides (if both are positive), subtract common terms, or factor. This often reveals the comparison without computing each side.",
        examples: [
          { problem: "A = (x+y)², B = x² + y²", steps: ["A = x² + 2xy + y²", "B = x² + y²", "A - B = 2xy", "If x and y are both positive → A > B", "If x is negative and y positive → depends on magnitude", "If x = 1, y = -2: A = (-1)² = 1, B = 1+4=5. A < B", "Answer: D"], answer: "D" },
          { problem: "A = √(49), B = √(36) + √(1)", steps: ["A = 7", "B = 6 + 1 = 7", "A = B", "Answer: C"], answer: "C" },
        ],
        questions: [
          { id: "qc-3-q1", text: "A = √(a²), B = a, for any real a", options: ["A > B", "B > A", "A = B", "Cannot determine"], correctIndex: 3, explanation: "If a=2: A=2, B=2. If a=-2: A=2, B=-2. A>B when a<0, A=B when a≥0. Cannot determine." },
        ],
        commonTraps: ["Assuming √(a²) = a (it's actually |a|)", "Not simplifying before comparing — computing each side fully when algebra would reveal the answer faster"],
        speedTips: ["Simplify the larger expression first, then compare", "Square both sides when dealing with square roots (if both are positive)"],
      },
      4: {
        level: 4,
        title: "Word Problems in QC",
        explanation: "QC word problems often test whether you can set up the relationship correctly. The trick is usually not about computation but about understanding the scenario and constraints on variables.",
        examples: [
          { problem: "John is 5 years older than Mary. A = John's age in 3 years, B = Mary's age in 8 years", steps: ["Let Mary = m, John = m+5", "A = m+8, B = m+8", "A = B", "Answer: C"], answer: "C" },
          { problem: "A sells a product for $100, 25% profit. B sells for $120, 20% profit. A = A's cost, B = B's cost", steps: ["A: cost × 1.25 = 100, cost = 80", "B: cost × 1.20 = 120, cost = 100", "A = 80, B = 100", "A < B", "Answer: B"], answer: "B" },
        ],
        questions: [
          { id: "qc-4-q1", text: "A circle's radius is 5. A = circumference, B = area ÷ 2", options: ["A > B", "B > A", "A = B", "Cannot determine"], correctIndex: 2, explanation: "C=10π, A=πr²=25π, A/2=12.5π. Wait: 10π vs 12.5π, B > A. Let me recalc: A=10π≈31.4, B=25π/2≈39.3. B > A." },
        ],
        commonTraps: ["Reading the question too quickly and comparing the wrong quantities", "Forgetting unit conversions (time, money, distance)"],
        speedTips: ["Translate word problems into algebraic expressions before comparing", "Pay attention to 'in 3 years' vs '3 years ago' — these change the expressions significantly"],
      },
    },
  },

  // ── BANKING: PERCENTAGE TRICKS ───────────────────────────
  "percentage-tricks": {
    id: "percentage-tricks",
    subjectId: "banking",
    topicPath: ["numerical", "percentages"],
    name: "Percentage Tricks",
    quickReference: {
      formula: "x% of y = y% of x (commutative property of percentages)",
      keyIdea: "A% of B = B% of A. This is the single most useful percentage shortcut.",
      shortcut: "Convert to fractions: 12.5% = 1/8, 20% = 1/5, 25% = 1/4, 33.33% = 1/3, etc.",
      commonMistake: "Adding percentages of different bases (e.g., 10% of X + 10% of Y ≠ 20% of (X+Y))",
    },
    levels: {
      1: {
        level: 1,
        title: "Basic Percentage",
        explanation: "A percentage is a fraction out of 100. To find A% of B, multiply A/100 × B. The commutative property: A% of B = B% of A (e.g., 8% of 50 = 50% of 8 = 4).",
        examples: [
          { problem: "What is 8% of 50?", steps: ["Use commutativity: 8% of 50 = 50% of 8", "50% of 8 = 4", "Answer: 4"], answer: "4" },
          { problem: "What is 15% of 80?", steps: ["15% of 80 = 80% of 15 = 12", "Or compute: 15/100 × 80 = 12"], answer: "12" },
        ],
        questions: [
          { id: "pt-1-q1", text: "7% of 70 = ?", options: ["4.9", "5.6", "6.3", "7"], correctIndex: 0, explanation: "7% of 70 = 70% of 7 = 0.7 × 7 = 4.9" },
          { id: "pt-1-q2", text: "12% of 25 = ?", options: ["3", "4", "5", "6"], correctIndex: 0, explanation: "12% of 25 = 25% of 12 = 0.25 × 12 = 3" },
        ],
        commonTraps: ["Not using the commutative property (makes it harder)", "Forgetting that x% = x/100"],
        speedTips: ["Swap tricky percentages: 7% of 50 → 50% of 7 = 3.5", "If A% of B looks hard, try B% of A"],
      },
      2: {
        level: 2,
        title: "Fraction Equivalents",
        explanation: "Memorizing common fraction equivalents makes percentage problems instant: 50%=1/2, 25%=1/4, 12.5%=1/8, 20%=1/5, 33.33%=1/3, 66.66%=2/3, 10%=1/10, 5%=1/20.",
        examples: [
          { problem: "What is 37.5% of 64?", steps: ["37.5% = 3/8 (since 12.5% = 1/8, so 37.5% = 3/8)", "3/8 × 64 = 24", "Answer: 24"], answer: "24" },
          { problem: "What is 16.67% of 60?", steps: ["16.67% = 1/6", "1/6 × 60 = 10", "Answer: 10"], answer: "10" },
        ],
        questions: [
          { id: "pt-2-q1", text: "62.5% of 88 = ?", options: ["55", "50", "60", "65"], correctIndex: 0, explanation: "62.5% = 5/8 (12.5% × 5). 5/8 × 88 = 55" },
          { id: "pt-2-q2", text: "16.67% of 120 = ?", options: ["20", "25", "15", "30"], correctIndex: 0, explanation: "16.67% = 1/6. 120/6 = 20" },
        ],
        commonTraps: ["Forgetting the exact fraction equivalent for common percentages", "Using 1/5 for 12.5% (it's 1/8)"],
        speedTips: ["Memorize this sequence: 10%=1/10, 12.5%=1/8, 16.67%=1/6, 20%=1/5, 25%=1/4, 33.33%=1/3, 50%=1/2", "Any multiple of these: 37.5%=3×12.5%=3/8, 62.5%=5/8, etc."],
      },
      3: {
        level: 3,
        title: "Successive Percentage Change",
        explanation: "When a quantity changes by a% then by b%, the net change is NOT (a+b)%. The formula is: net = (a + b + ab/100)%. For two successive increases, this formula gives the total increase.",
        examples: [
          { problem: "Price increases 10% then 20%. Net increase?", steps: ["Net = 10 + 20 + (10×20)/100 = 30 + 2 = 32%", "Verification: start at 100. After 10%: 110. After 20%: 132.", "Net increase: 32%"], answer: "32%" },
          { problem: "Price increases 20% then decreases 10%. Net change?", steps: ["Net = 20 + (-10) + (20×(-10))/100 = 10 + (-2) = 8%", "Verification: start 100. After 20%: 120. After -10%: 108.", "Net increase: 8%"], answer: "+8%" },
        ],
        questions: [
          { id: "pt-3-q1", text: "Price increases 15% then 15% again. Net increase?", options: ["30%", "32.25%", "32%", "30.25%"], correctIndex: 1, explanation: "Net = 15+15+(225/100) = 30+2.25 = 32.25%" },
        ],
        commonTraps: ["Adding percentages directly (10+20=30 instead of 32)", "Forgetting the sign when a decrease is involved (negative in the formula)"],
        speedTips: ["The formula works for any combination of increases (+) and decreases (-)", "For small percentages (<5%), ab/100 is negligible, so a+b is approximately correct"],
      },
      4: {
        level: 4,
        title: "Profit & Loss Percentages",
        explanation: "Profit% = (Profit/CP) × 100. Loss% = (Loss/CP) × 100. SP = CP × (1 + P%) for profit, CP × (1 - L%) for loss. Always calculate percentages on Cost Price unless specified otherwise.",
        examples: [
          { problem: "Bought at $80, sold at $100. Profit %?", steps: ["Profit = 100 - 80 = 20", "Profit% = 20/80 × 100 = 25%"], answer: "25%" },
          { problem: "Marked 40% above CP, then 20% discount. Net profit %?", steps: ["Assume CP = 100. Marked = 140.", "After 20% discount: 140 × 0.8 = 112.", "Profit = 12%, Net profit % = 12%"], answer: "12%" },
        ],
        questions: [
          { id: "pt-4-q1", text: "CP = $50, SP = $40. Loss %?", options: ["20%", "25%", "10%", "15%"], correctIndex: 0, explanation: "Loss = 10. Loss% = 10/50 × 100 = 20%" },
        ],
        commonTraps: ["Calculating profit% on SP instead of CP", "Adding discount% directly to markup% (40% markup - 20% discount ≠ 20% profit)"],
        speedTips: ["A discount is applied on Marked Price, profit is on Cost Price", "For successive markup then discount: final = CP × (1+m%) × (1-d%)"],
      },
    },
  },
};

export function getTechniqueById(id: string): Technique | undefined {
  return TECHNIQUES_BY_ID[id];
}

export function getTechniquesBySubject(subjectId: string): Technique[] {
  return Object.values(TECHNIQUES_BY_ID).filter((t) => t.subjectId === subjectId);
}

export function getTechniquesByTopicPath(subjectId: string, topicPath: string[]): Technique[] {
  return Object.values(TECHNIQUES_BY_ID).filter(
    (t) => t.subjectId === subjectId && topicPath.every((seg, i) => t.topicPath[i] === seg),
  );
}

export function getAllTechniques(): Technique[] {
  return Object.values(TECHNIQUES_BY_ID);
}
