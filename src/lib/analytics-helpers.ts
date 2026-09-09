import { Attempt, SectionType } from "@/types";
import {
  KpiMetrics,
  TrajectoryPoint,
  SectionalMasteryData,
  SectionMetric,
  StrengthWeaknessData,
  StrengthWeaknessItem,
  TimeAnalyticsData,
  TimeAnalyticsSection,
  NegativeMarkingLeakageData,
  NegativeLeakageAttemptPoint,
  TopicAccuracyItem,
  ImprovementTrendData,
  CountdownGoalSettings,
  FormattedAttemptRow,
} from "@/types/analytics";

const SECTION_LABELS: Record<SectionType, string> = {
  REASONING: "General Intelligence & Reasoning",
  GA: "General Awareness",
  QUANT: "Quantitative Aptitude",
  ENGLISH: "English Comprehension",
};

const SECTION_KEYS: SectionType[] = ["REASONING", "GA", "QUANT", "ENGLISH"];

export function formatPracticeTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0m";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatSecondsToMmSs(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s < 10 ? "0" : ""}${s}s`;
}

export function computeKpiMetrics(
  attempts: (Attempt & { mockTitle?: string })[]
): KpiMetrics {
  const scoredAttempts = attempts.filter((a) => a.score);
  const totalCompleted = scoredAttempts.length;

  if (totalCompleted === 0) {
    return {
      totalCompleted: 0,
      averageScore: 0,
      highestScore: 0,
      averageAccuracy: 0,
      totalPracticeSeconds: 0,
      practiceTimeFormatted: "0m",
      targetGap: -150,
      qualifyingRate: 0,
    };
  }

  const sumNet = scoredAttempts.reduce(
    (acc, curr) => acc + (curr.score?.netScore || 0),
    0
  );
  const averageScore = Number((sumNet / totalCompleted).toFixed(2));

  const highestScore = Math.max(
    ...scoredAttempts.map((a) => a.score?.netScore || 0)
  );

  const sumAccuracy = scoredAttempts.reduce(
    (acc, curr) => acc + (curr.score?.accuracyPercentage || 0),
    0
  );
  const averageAccuracy = Number((sumAccuracy / totalCompleted).toFixed(1));

  const totalPracticeSeconds = attempts.reduce(
    (acc, curr) => acc + (curr.timeTakenSeconds || 0),
    0
  );

  const targetGap = Number((averageScore - 150).toFixed(2));

  const qualifyingCount = scoredAttempts.filter(
    (a) => (a.score?.netScore || 0) >= 150
  ).length;
  const qualifyingRate = Math.round((qualifyingCount / totalCompleted) * 100);

  return {
    totalCompleted,
    averageScore,
    highestScore,
    averageAccuracy,
    totalPracticeSeconds,
    practiceTimeFormatted: formatPracticeTime(totalPracticeSeconds),
    targetGap,
    qualifyingRate,
  };
}

export function computeTrajectoryData(
  attempts: (Attempt & { mockTitle?: string })[],
  range: "last5" | "last10" | "all" = "all"
): TrajectoryPoint[] {
  const scoredAttempts = attempts.filter((a) => a.score);

  // Chronological order (oldest to newest for left-to-right progression)
  const chronological = [...scoredAttempts].sort((a, b) => {
    const dateA = new Date(a.submittedAt || a.startedAt).getTime();
    const dateB = new Date(b.submittedAt || b.startedAt).getTime();
    return dateA - dateB;
  });

  let sliced = chronological;
  if (range === "last5") {
    sliced = chronological.slice(-5);
  } else if (range === "last10") {
    sliced = chronological.slice(-10);
  }

  return sliced.map((att, idx) => {
    const dateObj = new Date(att.submittedAt || att.startedAt);
    const dateLabel = dateObj.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });

    const netScore = Number((att.score?.netScore || 0).toFixed(2));
    const rawScore = att.score?.correctCount || 0;
    const penalty =
      att.score?.negativePenalty ??
      Number(((att.score?.wrongCount || 0) * 0.25).toFixed(2));
    const accuracy = Number((att.score?.accuracyPercentage || 0).toFixed(1));

    return {
      attemptId: att.id,
      attemptNumber: idx + 1,
      dateLabel,
      mockTitle: att.mockTitle || `Attempt #${idx + 1}`,
      netScore,
      rawScore,
      negativePenalty: penalty,
      accuracyPercentage: accuracy,
      timeTakenSeconds: att.timeTakenSeconds || 0,
      targetBenchmark: 150,
    };
  });
}

export function computeSectionalMastery(
  attempts: (Attempt & { mockTitle?: string })[]
): SectionalMasteryData {
  const scoredAttempts = attempts.filter((a) => a.score);
  const total = scoredAttempts.length;

  const bySection: Record<SectionType, SectionMetric> = {
    REASONING: {
      section: "REASONING",
      label: "Reasoning",
      avgNet: 0,
      avgRaw: 0,
      avgAccuracy: 0,
      totalQuestions: 50,
      avgTimeSpentSeconds: 0,
    },
    GA: {
      section: "GA",
      label: "General Awareness",
      avgNet: 0,
      avgRaw: 0,
      avgAccuracy: 0,
      totalQuestions: 50,
      avgTimeSpentSeconds: 0,
    },
    QUANT: {
      section: "QUANT",
      label: "Quantitative",
      avgNet: 0,
      avgRaw: 0,
      avgAccuracy: 0,
      totalQuestions: 50,
      avgTimeSpentSeconds: 0,
    },
    ENGLISH: {
      section: "ENGLISH",
      label: "English",
      avgNet: 0,
      avgRaw: 0,
      avgAccuracy: 0,
      totalQuestions: 50,
      avgTimeSpentSeconds: 0,
    },
  };

  if (total > 0) {
    for (const key of SECTION_KEYS) {
      let sumNet = 0;
      let sumRaw = 0;
      let sumAcc = 0;
      let sumTime = 0;

      for (const a of scoredAttempts) {
        const s = a.score?.bySection?.[key];
        if (s) {
          sumNet += s.netScore || 0;
          sumRaw += s.correct || 0;
          sumAcc += s.accuracyPercentage || 0;
          sumTime += s.timeSpentSeconds || 0;
        }
      }

      bySection[key] = {
        section: key,
        label: key === "REASONING" ? "Reasoning" : key === "GA" ? "General Awareness" : key === "QUANT" ? "Quantitative" : "English",
        avgNet: Number((sumNet / total).toFixed(1)),
        avgRaw: Number((sumRaw / total).toFixed(1)),
        avgAccuracy: Number((sumAcc / total).toFixed(1)),
        totalQuestions: 50,
        avgTimeSpentSeconds: Math.round(sumTime / total),
      };
    }
  }

  // Find best and weakest based on accuracy, with tie-break on avgNet
  let bestSec: SectionType = "REASONING";
  let weakestSec: SectionType = "GA";
  let maxAcc = -1;
  let minAcc = 9999;

  for (const key of SECTION_KEYS) {
    const acc = bySection[key].avgAccuracy;
    if (acc > maxAcc) {
      maxAcc = acc;
      bestSec = key;
    }
    if (acc < minAcc) {
      minAcc = acc;
      weakestSec = key;
    }
  }

  const radarData = SECTION_KEYS.map((key) => ({
    section: bySection[key].label,
    sectionKey: key,
    accuracy: bySection[key].avgAccuracy,
    fullMark: 100,
  }));

  const barData = SECTION_KEYS.map((key) => ({
    section: bySection[key].label,
    sectionKey: key,
    avgNet: bySection[key].avgNet,
    maxScore: 50,
    accuracy: bySection[key].avgAccuracy,
    isBest: key === bestSec,
    isWeakest: key === weakestSec,
  }));

  return {
    bySection,
    radarData,
    barData,
    bestSection: bestSec,
    weakestSection: weakestSec,
  };
}

export function computeStrengthWeakness(
  sectionalData: SectionalMasteryData,
  attempts: (Attempt & { mockTitle?: string })[]
): StrengthWeaknessData {
  const scoredAttempts = attempts.filter((a) => a.score);
  const total = scoredAttempts.length;

  const adviceMap: Record<SectionType, string> = {
    REASONING:
      "Maintain momentum on coding-decoding and series; practice speed on spatial and non-verbal puzzles.",
    GA:
      "High negative marking risk. Avoid wild 50-50 guesses in static GK & Polity; review current affairs digest.",
    QUANT:
      "Focus on high-yield arithmetic (Percentages, Ratio, SI/CI, Time & Work). Skip overly tedious calculations early.",
    ENGLISH:
      "Strong scoring potential. Hone error spotting rules and vocabulary to maintain a 90%+ accuracy rate.",
  };

  const items: StrengthWeaknessItem[] = SECTION_KEYS.map((secKey) => {
    const sec = sectionalData.bySection[secKey];
    let totalWrong = 0;
    let totalAttempted = 0;
    let totalUnanswered = 0;

    if (total > 0) {
      for (const a of scoredAttempts) {
        const s = a.score?.bySection?.[secKey];
        if (s) {
          totalWrong += s.wrong || 0;
          totalAttempted += (s.correct || 0) + (s.wrong || 0);
          totalUnanswered += s.unanswered || 0;
        }
      }
    }

    const wrongRate =
      totalAttempted > 0
        ? Number(((totalWrong / totalAttempted) * 100).toFixed(1))
        : 0;
    const unattemptedRate =
      total > 0
        ? Number(((totalUnanswered / (50 * total)) * 100).toFixed(1))
        : 0;

    return {
      section: secKey,
      label: sec.label,
      accuracyPercentage: sec.avgAccuracy,
      avgNetScore: sec.avgNet,
      wrongRate,
      unattemptedRate,
      advice: adviceMap[secKey],
    };
  });

  // Sort by accuracy descending
  const sorted = [...items].sort(
    (a, b) => b.accuracyPercentage - a.accuracyPercentage
  );

  return {
    strengths: sorted.slice(0, 2),
    weaknesses: sorted.slice(-2).reverse(),
  };
}

export function computeTimeAnalytics(
  attempts: (Attempt & { mockTitle?: string })[]
): TimeAnalyticsData {
  const scoredAttempts = attempts.filter((a) => a.score);
  const total = scoredAttempts.length;

  const sections: TimeAnalyticsSection[] = SECTION_KEYS.map((key) => {
    let sumSec = 0;
    if (total > 0) {
      for (const a of scoredAttempts) {
        const s = a.score?.bySection?.[key];
        sumSec += s?.timeSpentSeconds || 0;
      }
    }

    // Default time partition is 45 minutes if not recorded
    let avgMinutes = total > 0 ? Number((sumSec / total / 60).toFixed(1)) : 0;
    if (avgMinutes === 0 && total > 0) {
      // If sectional time wasn't separately tracked in older mocks, divide total evenly
      const avgTotalTime =
        scoredAttempts.reduce((acc, a) => acc + (a.timeTakenSeconds || 0), 0) /
        total;
      avgMinutes = Number((avgTotalTime / 4 / 60).toFixed(1));
    }

    const isOverrun = avgMinutes > 45.0;

    return {
      section: key,
      label:
        key === "REASONING"
          ? "Reasoning"
          : key === "GA"
          ? "General Awareness"
          : key === "QUANT"
          ? "Quantitative"
          : "English",
      avgMinutes,
      targetMinutes: 45,
      isOverrun,
    };
  });

  const avgTotalSeconds =
    total > 0
      ? scoredAttempts.reduce((acc, a) => acc + (a.timeTakenSeconds || 0), 0) /
        total
      : 0;
  // 200 questions in 180 minutes = 54 seconds per question
  const avgSecondsPerQuestion = total > 0 ? Math.round(avgTotalSeconds / 200) : 0;

  const overrunSections = sections
    .filter((s) => s.isOverrun)
    .map((s) => s.label);

  return {
    sections,
    avgSecondsPerQuestion,
    benchmarkSecondsPerQuestion: 54,
    hasAnyOverrun: overrunSections.length > 0,
    overrunSections,
  };
}

export function computeNegativeMarkingLeakage(
  attempts: (Attempt & { mockTitle?: string })[]
): NegativeMarkingLeakageData {
  const scoredAttempts = attempts.filter((a) => a.score);
  const total = scoredAttempts.length;

  if (total === 0) {
    return {
      totalPenaltyMarksLost: 0,
      averagePenaltyPerMock: 0,
      totalWrongAnswers: 0,
      potentialNetScore: 0,
      attemptsData: [],
      adviceQuote:
        "Take mock tests to track penalty leakage and optimize guessing discipline.",
    };
  }

  let totalPenalty = 0;
  let totalWrong = 0;

  const attemptsData: NegativeLeakageAttemptPoint[] = scoredAttempts.map(
    (att, idx) => {
      const wrong = att.score?.wrongCount || 0;
      const penalty =
        att.score?.negativePenalty ?? Number((wrong * 0.25).toFixed(2));
      const correct = att.score?.correctCount || 0;
      const unattempted = att.score?.unansweredCount || 0;
      const net = att.score?.netScore || 0;

      totalPenalty += penalty;
      totalWrong += wrong;

      return {
        attemptId: att.id,
        attemptNumber: idx + 1,
        label: att.mockTitle || `Mock #${idx + 1}`,
        correctMarks: correct,
        penaltyLost: Number(penalty.toFixed(2)),
        unattemptedMarks: unattempted,
        netScore: Number(net.toFixed(2)),
      };
    }
  );

  const averagePenalty = Number((totalPenalty / total).toFixed(2));
  const avgNet =
    scoredAttempts.reduce((acc, a) => acc + (a.score?.netScore || 0), 0) /
    total;
  const potentialNet = Number((avgNet + averagePenalty).toFixed(2));

  let adviceQuote = "";
  if (averagePenalty >= 5.0) {
    adviceQuote = `Eliminating wild guesses would preserve ~${averagePenalty} net marks per exam, boosting your trajectory to ~${potentialNet} / 200.`;
  } else if (averagePenalty > 0) {
    adviceQuote = `Strong discipline! You are losing only ~${averagePenalty} marks to negative penalty per mock. Target zero wild guesses.`;
  } else {
    adviceQuote =
      "Flawless accuracy discipline! Zero penalty marks lost to negative marking.";
  }

  return {
    totalPenaltyMarksLost: Number(totalPenalty.toFixed(2)),
    averagePenaltyPerMock: averagePenalty,
    totalWrongAnswers: totalWrong,
    potentialNetScore: potentialNet,
    attemptsData: attemptsData.slice(-10), // latest 10
    adviceQuote,
  };
}

export function computeTopicHeatmap(
  attempts: (Attempt & { mockTitle?: string })[]
): TopicAccuracyItem[] {
  // Check if any attempts have question-level topic analysis
  const topicMap = new Map<
    string,
    {
      topic: string;
      section: SectionType;
      total: number;
      correct: number;
      wrong: number;
    }
  >();

  for (const att of attempts) {
    // If attempt has aiAnalysis or topic analysis attached
    const aiAnalysis = (att as any).aiAnalysis;
    if (aiAnalysis?.topicAnalysis) {
      for (const t of aiAnalysis.topicAnalysis) {
        if (!t.topicLabel) continue;
        const key = `${t.section}_${t.topicLabel}`;
        const existing = topicMap.get(key) || {
          topic: t.topicLabel,
          section: t.section as SectionType,
          total: 0,
          correct: 0,
          wrong: 0,
        };
        existing.total += t.total || 0;
        existing.correct += t.correct || 0;
        existing.wrong += t.wrong || 0;
        topicMap.set(key, existing);
      }
    }
  }

  if (topicMap.size === 0) {
    return [];
  }

  const items: TopicAccuracyItem[] = Array.from(topicMap.values()).map(
    (item) => ({
      topic: item.topic,
      section: item.section,
      totalQuestions: item.total,
      correctCount: item.correct,
      wrongCount: item.wrong,
      accuracyPercentage:
        item.total > 0
          ? Math.round((item.correct / item.total) * 100)
          : 0,
    })
  );

  return items.sort((a, b) => b.accuracyPercentage - a.accuracyPercentage);
}

export function computeImprovementTrend(
  attempts: (Attempt & { mockTitle?: string })[]
): ImprovementTrendData {
  const scoredAttempts = attempts.filter((a) => a.score);
  const total = scoredAttempts.length;

  if (total === 0) {
    return {
      status: "baseline",
      delta: 0,
      deltaLabel: "No Tests",
      recentAvg: 0,
      priorAvg: 0,
      comparisonText: "Take your first mock to establish a baseline.",
    };
  }

  // Sort chronological
  const chronological = [...scoredAttempts].sort((a, b) => {
    const dateA = new Date(a.submittedAt || a.startedAt).getTime();
    const dateB = new Date(b.submittedAt || b.startedAt).getTime();
    return dateA - dateB;
  });

  if (total < 2) {
    const s = chronological[0].score?.netScore || 0;
    return {
      status: "baseline",
      delta: 0,
      deltaLabel: "Baseline",
      recentAvg: s,
      priorAvg: 0,
      comparisonText: `Initial baseline score: ${s.toFixed(1)}/200 marks. Complete another mock to track momentum.`,
    };
  }

  // If 2 to 5 attempts: compare last half vs first half
  if (total < 6) {
    const half = Math.floor(total / 2);
    const prior = chronological.slice(0, half);
    const recent = chronological.slice(half);

    const priorAvg =
      prior.reduce((acc, a) => acc + (a.score?.netScore || 0), 0) / prior.length;
    const recentAvg =
      recent.reduce((acc, a) => acc + (a.score?.netScore || 0), 0) /
      recent.length;
    const delta = Number((recentAvg - priorAvg).toFixed(2));

    let status: "improving" | "plateau" | "declining" = "plateau";
    if (delta >= 2.0) status = "improving";
    else if (delta <= -2.0) status = "declining";

    const sign = delta > 0 ? "+" : "";
    const deltaLabel =
      status === "improving"
        ? `Improving ↑ (${sign}${delta})`
        : status === "declining"
        ? `Declining ↓ (${delta})`
        : `Plateau → (${sign}${delta})`;

    return {
      status,
      delta,
      deltaLabel,
      recentAvg: Number(recentAvg.toFixed(1)),
      priorAvg: Number(priorAvg.toFixed(1)),
      comparisonText: `Latest attempts avg: ${recentAvg.toFixed(1)} vs earlier: ${priorAvg.toFixed(1)} marks`,
    };
  }

  // If >= 6 attempts: rolling 3-attempt comparison
  const last3 = chronological.slice(-3);
  const prior3 = chronological.slice(-6, -3);

  const last3Avg =
    last3.reduce((acc, a) => acc + (a.score?.netScore || 0), 0) / 3;
  const prior3Avg =
    prior3.reduce((acc, a) => acc + (a.score?.netScore || 0), 0) / 3;
  const delta = Number((last3Avg - prior3Avg).toFixed(2));

  let status: "improving" | "plateau" | "declining" = "plateau";
  if (delta >= 2.0) status = "improving";
  else if (delta <= -2.0) status = "declining";

  const sign = delta > 0 ? "+" : "";
  const deltaLabel =
    status === "improving"
      ? `Improving ↑ (${sign}${delta})`
      : status === "declining"
      ? `Declining ↓ (${delta})`
      : `Plateau → (${sign}${delta})`;

  return {
    status,
    delta,
    deltaLabel,
    recentAvg: Number(last3Avg.toFixed(1)),
    priorAvg: Number(prior3Avg.toFixed(1)),
    comparisonText: `Rolling 3-attempt avg: ${last3Avg.toFixed(1)} vs prior 3: ${prior3Avg.toFixed(1)} marks`,
  };
}

export function computeCountdownGoal(
  targetDateStr?: string,
  targetScore = 150,
  avgScore = 0
): CountdownGoalSettings {
  // Default target date: 45 days from today if not set
  let targetDate: Date;
  if (targetDateStr) {
    targetDate = new Date(targetDateStr);
  } else {
    targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 45);
  }

  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const progressPercentage = Math.min(
    100,
    Math.max(0, Math.round((avgScore / targetScore) * 100))
  );

  return {
    targetExamDate: targetDate.toISOString().split("T")[0],
    targetScore,
    daysRemaining,
    progressPercentage,
  };
}

export function formatAttemptRows(
  attempts: (Attempt & { mockTitle?: string })[]
): FormattedAttemptRow[] {
  const scoredAttempts = attempts.filter((a) => a.score);

  // Newest first
  const sorted = [...scoredAttempts].sort((a, b) => {
    const dateA = new Date(a.submittedAt || a.startedAt).getTime();
    const dateB = new Date(b.submittedAt || b.startedAt).getTime();
    return dateB - dateA;
  });

  return sorted.slice(0, 10).map((att) => {
    const score = att.score!;
    const dateObj = new Date(att.submittedAt || att.startedAt);
    const dateFormatted = dateObj.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const netScore = Number((score.netScore || 0).toFixed(2));
    const rawScore = score.correctCount || 0;
    const penalty =
      score.negativePenalty ??
      Number(((score.wrongCount || 0) * 0.25).toFixed(2));
    const accuracy = Number((score.accuracyPercentage || 0).toFixed(1));

    return {
      id: att.id,
      mockId: att.mockId,
      mockTitle: att.mockTitle || "NBE Full Mock Test",
      dateFormatted,
      netScore,
      rawScore,
      penalty,
      accuracy,
      timeFormatted: formatPracticeTime(att.timeTakenSeconds || 0),
      qualifyingCleared: score.qualifyingCleared ?? netScore >= 150,
    };
  });
}
