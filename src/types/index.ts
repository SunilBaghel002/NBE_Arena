export type SectionType = "REASONING" | "GA" | "QUANT" | "ENGLISH";

export interface QuestionOptions {
  a: string;
  b: string;
  c: string;
  d: string;
}

export type OptionKey = "a" | "b" | "c" | "d";

/** What a question's artwork actually is, for blueprint quotas and UI hints. */
export type FigureKind = "table" | "chart" | "diagram" | "";

/** How the answer key was obtained — geometry recovery is not infallible. */
export type AnswerConfidence = "high" | "medium" | "none";

export type UserRole = "admin" | "student";

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Question {
  id: string; // uuid or unique string
  contentHash?: string;
  section: SectionType;
  questionText: string;
  options: QuestionOptions;
  correctOption: OptionKey | null;
  answerConfidence?: AnswerConfidence;
  explanation?: string;
  hasImage: boolean;
  /** Stem artwork: diagram, match-table or graph printed above the options. */
  imagePath?: string;
  /**
   * Per-option artwork. Non-verbal reasoning options are pictures, not text, so
   * these carry the actual answer choices — `options.a` then holds the same URL
   * as a fallback for callers that only read text.
   */
  optionImages?: QuestionOptions;
  optionsAreImages?: boolean;
  /** True when the question is a picture with no readable stem text at all. */
  stemIsFigureOnly?: boolean;
  figureCount?: number;
  figureKind?: FigureKind;
  topic?: string;
  sourceExam: string; // e.g. "SSC_CHSL_2023_Tier1", "NBE_2015"
  sourceYear?: number;
  /** Provenance back to the PDF, so any figure can be checked against print. */
  sourcePage?: number;
  sourceQuestionNumber?: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  isActive: boolean;
  createdAt: string;
}

export interface MockTest {
  id: string;
  title: string;
  createdAt: string;
  timeLimitMinutes: number; // 180
  sections: {
    REASONING: string[]; // array of 50 question IDs
    GA: string[]; // array of 50 question IDs
    QUANT: string[]; // array of 50 question IDs
    ENGLISH: string[]; // array of 50 question IDs
  };
  totalQuestions: number; // 200
}

export type QuestionStatus =
  | "answered"
  | "marked"
  | "answered_marked"
  | "not_visited"
  | "unanswered";

export interface AnswerState {
  questionId: string;
  selectedOption: OptionKey | null;
  status: QuestionStatus;
  timeSpentSeconds?: number;
}

export interface SectionScore {
  section: SectionType;
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  netScore: number;
  accuracyPercentage: number;
  timeSpentSeconds: number;
}

export interface AttemptScore {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  rawScore: number;
  negativePenalty: number;
  netScore: number;
  accuracyPercentage: number;
  qualifyingCleared: boolean; // netScore >= 150
  targetScore: number; // 150
  bySection: Record<SectionType, SectionScore>;
}

export interface Attempt {
  id: string;
  userId?: string; // Links attempt to candidate user account
  userName?: string;
  mockId: string;
  mockTitle?: string;
  startedAt: string;
  submittedAt?: string;
  timeTakenSeconds: number;
  answers: AnswerState[];
  score?: AttemptScore;
}

export interface BankStats {
  total: number;
  bySection: Record<SectionType, number>;
  activeTotal: number;
  activeBySection: Record<SectionType, number>;
  sources: { sourceExam: string; count: number }[];
}

export interface HydratedQuestion extends Omit<Question, "correctOption"> {
  // correctOption is stripped during live test to prevent cheating in devtools
  correctOption?: OptionKey | null;
}

export interface HydratedMockTest {
  id: string;
  title: string;
  createdAt: string;
  timeLimitMinutes: number;
  totalQuestions: number;
  questions: Record<string, HydratedQuestion>;
  sections: {
    REASONING: string[];
    GA: string[];
    QUANT: string[];
    ENGLISH: string[];
  };
}
