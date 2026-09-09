import { SectionType } from "./index";

export interface KpiMetrics {
  totalCompleted: number;
  averageScore: number;
  highestScore: number;
  averageAccuracy: number;
  totalPracticeSeconds: number;
  practiceTimeFormatted: string;
  targetGap: number; // averageScore - 150 (e.g. -24.5 or +5.0)
  qualifyingRate: number; // percentage of attempts >= 150
}

export interface TrajectoryPoint {
  attemptId: string;
  attemptNumber: number;
  dateLabel: string;
  mockTitle: string;
  netScore: number;
  rawScore: number;
  negativePenalty: number;
  accuracyPercentage: number;
  timeTakenSeconds: number;
  targetBenchmark: number; // 150
}

export interface SectionMetric {
  section: SectionType;
  label: string;
  avgNet: number;
  avgRaw: number;
  avgAccuracy: number;
  totalQuestions: number; // 50
  avgTimeSpentSeconds: number;
}

export interface SectionalMasteryData {
  bySection: Record<SectionType, SectionMetric>;
  radarData: {
    section: string;
    sectionKey: SectionType;
    accuracy: number;
    fullMark: number; // 100
  }[];
  barData: {
    section: string;
    sectionKey: SectionType;
    avgNet: number;
    maxScore: number; // 50
    accuracy: number;
    isBest: boolean;
    isWeakest: boolean;
  }[];
  bestSection: SectionType;
  weakestSection: SectionType;
}

export interface StrengthWeaknessItem {
  section: SectionType;
  label: string;
  accuracyPercentage: number;
  avgNetScore: number;
  wrongRate: number; // (wrong / attempted) * 100
  unattemptedRate: number; // (unanswered / 50) * 100
  advice: string;
}

export interface StrengthWeaknessData {
  strengths: StrengthWeaknessItem[]; // Top 2
  weaknesses: StrengthWeaknessItem[]; // Bottom 2
}

export interface TimeAnalyticsSection {
  section: SectionType;
  label: string;
  avgMinutes: number;
  targetMinutes: number; // 45 minutes
  isOverrun: boolean;
}

export interface TimeAnalyticsData {
  sections: TimeAnalyticsSection[];
  avgSecondsPerQuestion: number;
  benchmarkSecondsPerQuestion: number; // 54 seconds (180 mins / 200 Qs)
  hasAnyOverrun: boolean;
  overrunSections: string[];
}

export interface NegativeLeakageAttemptPoint {
  attemptId: string;
  attemptNumber: number;
  label: string;
  correctMarks: number;
  penaltyLost: number;
  unattemptedMarks: number;
  netScore: number;
}

export interface NegativeMarkingLeakageData {
  totalPenaltyMarksLost: number;
  averagePenaltyPerMock: number;
  totalWrongAnswers: number;
  potentialNetScore: number; // averageScore + averagePenaltyPerMock
  attemptsData: NegativeLeakageAttemptPoint[];
  adviceQuote: string;
}

export interface TopicAccuracyItem {
  topic: string;
  section: SectionType;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracyPercentage: number;
}

export interface ImprovementTrendData {
  status: "improving" | "plateau" | "declining" | "baseline";
  delta: number; // score difference
  deltaLabel: string;
  recentAvg: number;
  priorAvg: number;
  comparisonText: string;
}

export interface CountdownGoalSettings {
  targetExamDate: string; // ISO string or YYYY-MM-DD
  targetScore: number; // Default 150
  daysRemaining: number;
  progressPercentage: number;
}

export interface FormattedAttemptRow {
  id: string;
  mockId: string;
  mockTitle: string;
  dateFormatted: string;
  netScore: number;
  rawScore: number;
  penalty: number;
  accuracy: number;
  timeFormatted: string;
  qualifyingCleared: boolean;
}
