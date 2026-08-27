import { Question, AnswerState, AttemptScore, SectionScore, SectionType } from "@/types";

export function calculateAttemptScore(
  mockQuestions: Question[],
  answers: AnswerState[],
  timeTakenSeconds: number = 0
): AttemptScore {
  const questionMap = new Map<string, Question>();
  mockQuestions.forEach((q) => questionMap.set(q.id, q));

  const answerMap = new Map<string, AnswerState>();
  answers.forEach((a) => answerMap.set(a.questionId, a));

  const sections: SectionType[] = ["REASONING", "GA", "QUANT", "ENGLISH"];

  const sectionCounters: Record<
    SectionType,
    { total: number; correct: number; wrong: number; unanswered: number; time: number }
  > = {
    REASONING: { total: 0, correct: 0, wrong: 0, unanswered: 0, time: 0 },
    GA: { total: 0, correct: 0, wrong: 0, unanswered: 0, time: 0 },
    QUANT: { total: 0, correct: 0, wrong: 0, unanswered: 0, time: 0 },
    ENGLISH: { total: 0, correct: 0, wrong: 0, unanswered: 0, time: 0 },
  };

  let totalQuestions = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  for (const q of mockQuestions) {
    totalQuestions++;
    const sec = q.section;
    sectionCounters[sec].total++;

    const ans = answerMap.get(q.id);
    const selectedOption = ans?.selectedOption || null;
    const timeSpent = ans?.timeSpentSeconds || 0;
    sectionCounters[sec].time += timeSpent;

    if (!selectedOption) {
      unansweredCount++;
      sectionCounters[sec].unanswered++;
    } else {
      if (q.correctOption && selectedOption === q.correctOption) {
        correctCount++;
        sectionCounters[sec].correct++;
      } else {
        wrongCount++;
        sectionCounters[sec].wrong++;
      }
    }
  }

  const rawScore = correctCount * 1.0;
  const negativePenalty = wrongCount * 0.25;
  const netScore = Number((rawScore - negativePenalty).toFixed(2));

  const totalAttempted = correctCount + wrongCount;
  const accuracyPercentage =
    totalAttempted > 0 ? Number(((correctCount / totalAttempted) * 100).toFixed(1)) : 0;

  const bySection = {} as Record<SectionType, SectionScore>;

  for (const sec of sections) {
    const data = sectionCounters[sec];
    const secAttempted = data.correct + data.wrong;
    const secRaw = data.correct * 1.0;
    const secPenalty = data.wrong * 0.25;
    const secNet = Number((secRaw - secPenalty).toFixed(2));
    const secAccuracy =
      secAttempted > 0 ? Number(((data.correct / secAttempted) * 100).toFixed(1)) : 0;

    bySection[sec] = {
      section: sec,
      total: data.total,
      correct: data.correct,
      wrong: data.wrong,
      unanswered: data.unanswered,
      netScore: secNet,
      accuracyPercentage: secAccuracy,
      timeSpentSeconds: data.time,
    };
  }

  const targetScore = 150;
  const qualifyingCleared = netScore >= targetScore;

  return {
    totalQuestions,
    correctCount,
    wrongCount,
    unansweredCount,
    rawScore,
    negativePenalty,
    netScore,
    accuracyPercentage,
    qualifyingCleared,
    targetScore,
    bySection,
  };
}
