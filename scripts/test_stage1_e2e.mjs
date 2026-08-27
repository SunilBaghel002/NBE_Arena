import { calculateAttemptScore } from "../src/lib/scoring.ts";
import { getQuestions } from "../src/lib/db.ts";

async function runTests() {
  console.log("=== RUNNING STAGE 1 AUTOMATED INTEGRATION TESTS ===");

  // 1. Check Questions
  const questions = await getQuestions();
  console.log(`Total questions in bank: ${questions.length}`);
  if (questions.length !== 200) {
    throw new Error(`Expected 200 questions, got ${questions.length}`);
  }

  const bySection = { REASONING: 0, GA: 0, QUANT: 0, ENGLISH: 0 };
  for (const q of questions) {
    bySection[q.section]++;
    if (!q.options.a || !q.options.b || !q.options.c || !q.options.d) {
      throw new Error(`Question ${q.id} missing options`);
    }
    if (!["a", "b", "c", "d"].includes(q.correctOption)) {
      throw new Error(`Question ${q.id} has invalid correctOption: ${q.correctOption}`);
    }
  }

  console.log("Section counts:", bySection);
  if (bySection.REASONING !== 50 || bySection.GA !== 50 || bySection.QUANT !== 50 || bySection.ENGLISH !== 50) {
    throw new Error("Section balance failed: must be 50 each");
  }

  // 2. Test Scoring Engine Negative Marking Calculation
  console.log("\nTesting Scoring Logic...");

  // Scenario A: 160 correct, 20 wrong, 20 unanswered
  const mockAnswers = [];
  let cCount = 0;
  let wCount = 0;

  for (let i = 0; i < 200; i++) {
    const q = questions[i];
    if (i < 160) {
      // Correct
      mockAnswers.push({
        questionId: q.id,
        selectedOption: q.correctOption,
        status: "answered",
        timeSpentSeconds: 40,
      });
      cCount++;
    } else if (i < 180) {
      // Wrong (choose an option different from correct)
      const wrongOpt = q.correctOption === "a" ? "b" : "a";
      mockAnswers.push({
        questionId: q.id,
        selectedOption: wrongOpt,
        status: "answered",
        timeSpentSeconds: 30,
      });
      wCount++;
    } else {
      // Blank / Unanswered
      mockAnswers.push({
        questionId: q.id,
        selectedOption: null,
        status: "unanswered",
        timeSpentSeconds: 5,
      });
    }
  }

  const scoreResult = calculateAttemptScore(questions, mockAnswers, 5400);
  console.log(`Calculated Score:`, {
    correct: scoreResult.correctCount,
    wrong: scoreResult.wrongCount,
    unanswered: scoreResult.unansweredCount,
    raw: scoreResult.rawScore,
    penalty: scoreResult.negativePenalty,
    net: scoreResult.netScore,
    accuracy: scoreResult.accuracyPercentage,
    qualifying: scoreResult.qualifyingCleared,
  });

  // Expected Net = 160 - (20 * 0.25) = 160 - 5 = 155.00
  if (scoreResult.netScore !== 155) {
    throw new Error(`Expected netScore 155, got ${scoreResult.netScore}`);
  }
  if (!scoreResult.qualifyingCleared) {
    throw new Error("Expected qualifyingCleared to be true for 155 net score");
  }
  if (scoreResult.negativePenalty !== 5.0) {
    throw new Error(`Expected penalty 5.0, got ${scoreResult.negativePenalty}`);
  }

  // Scenario B: Below 150 benchmark (e.g. 140 correct, 40 wrong => 140 - 10 = 130)
  const mockAnswersBelow = [];
  for (let i = 0; i < 200; i++) {
    const q = questions[i];
    if (i < 140) {
      mockAnswersBelow.push({ questionId: q.id, selectedOption: q.correctOption, status: "answered" });
    } else if (i < 180) {
      const wrongOpt = q.correctOption === "a" ? "b" : "a";
      mockAnswersBelow.push({ questionId: q.id, selectedOption: wrongOpt, status: "answered" });
    } else {
      mockAnswersBelow.push({ questionId: q.id, selectedOption: null, status: "unanswered" });
    }
  }

  const scoreResultBelow = calculateAttemptScore(questions, mockAnswersBelow, 5000);
  console.log(`Calculated Score (Below Target):`, {
    net: scoreResultBelow.netScore,
    qualifying: scoreResultBelow.qualifyingCleared,
  });

  if (scoreResultBelow.netScore !== 130) {
    throw new Error(`Expected netScore 130, got ${scoreResultBelow.netScore}`);
  }
  if (scoreResultBelow.qualifyingCleared) {
    throw new Error("Expected qualifyingCleared to be false for 130 net score");
  }

  console.log("\nALL STAGE 1 UNIT & INTEGRATION CHECKS PASSED SUCCESSFULLY!");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
