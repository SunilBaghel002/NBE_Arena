import { create } from "zustand";
import {
  SectionType,
  OptionKey,
  QuestionStatus,
  AnswerState,
  HydratedQuestion,
  HydratedMockTest,
} from "@/types";

interface TestStoreState {
  mockId: string | null;
  attemptId: string | null;
  mockTitle: string;
  currentSection: SectionType;
  currentIndex: number; // 0 to 49 within currentSection
  sections: Record<SectionType, string[]>;
  questions: Record<string, HydratedQuestion>;
  answers: Record<string, AnswerState>;
  remainingSeconds: number; // starts at 10800 (180 mins)
  isSubmitted: boolean;
  isSubmitting: boolean;
  isInitialized: boolean;

  // Actions
  initTest: (mockData: HydratedMockTest, existingAttemptId?: string) => void;
  selectOption: (option: OptionKey) => void;
  clearResponse: () => void;
  markForReview: () => void;
  saveAndNext: () => void;
  prevQuestion: () => void;
  nextQuestion: () => void;
  jumpToQuestion: (section: SectionType, index: number) => void;
  changeSection: (section: SectionType) => void;
  tick: () => void;
  setSubmitting: (val: boolean) => void;
  setSubmitted: (val: boolean) => void;
  restoreFromLocalStorage: (mockId: string) => boolean;
  saveToLocalStorage: () => void;
  clearLocalStorage: () => void;
}

const SECTION_ORDER: SectionType[] = ["REASONING", "GA", "QUANT", "ENGLISH"];
const TOTAL_EXAM_SECONDS = 180 * 60; // 10800 seconds

export const useTestStore = create<TestStoreState>((set, get) => ({
  mockId: null,
  attemptId: null,
  mockTitle: "",
  currentSection: "REASONING",
  currentIndex: 0,
  sections: {
    REASONING: [],
    GA: [],
    QUANT: [],
    ENGLISH: [],
  },
  questions: {},
  answers: {},
  remainingSeconds: TOTAL_EXAM_SECONDS,
  isSubmitted: false,
  isSubmitting: false,
  isInitialized: false,

  initTest: (mockData, existingAttemptId) => {
    const attemptId = existingAttemptId || `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Initialize default answer state for all 200 questions
    const answers: Record<string, AnswerState> = {};
    const allIds = [
      ...mockData.sections.REASONING,
      ...mockData.sections.GA,
      ...mockData.sections.QUANT,
      ...mockData.sections.ENGLISH,
    ];

    allIds.forEach((qId, idx) => {
      answers[qId] = {
        questionId: qId,
        selectedOption: null,
        status: idx === 0 ? "unanswered" : "not_visited", // First question visited immediately
        timeSpentSeconds: 0,
      };
    });

    set({
      mockId: mockData.id,
      attemptId,
      mockTitle: mockData.title,
      currentSection: "REASONING",
      currentIndex: 0,
      sections: mockData.sections,
      questions: mockData.questions,
      answers,
      remainingSeconds: TOTAL_EXAM_SECONDS,
      isSubmitted: false,
      isSubmitting: false,
      isInitialized: true,
    });

    // Check if previous saved state exists in localStorage
    get().restoreFromLocalStorage(mockData.id);
  },

  selectOption: (option: OptionKey) => {
    const state = get();
    const currentQId = state.sections[state.currentSection]?.[state.currentIndex];
    if (!currentQId) return;

    const currentAns = state.answers[currentQId] || {
      questionId: currentQId,
      selectedOption: null,
      status: "unanswered",
      timeSpentSeconds: 0,
    };

    const newStatus: QuestionStatus =
      currentAns.status === "marked" || currentAns.status === "answered_marked"
        ? "answered_marked"
        : "answered";

    const updatedAnswers = {
      ...state.answers,
      [currentQId]: {
        ...currentAns,
        selectedOption: option,
        status: newStatus,
      },
    };

    set({ answers: updatedAnswers });
    get().saveToLocalStorage();
  },

  clearResponse: () => {
    const state = get();
    const currentQId = state.sections[state.currentSection]?.[state.currentIndex];
    if (!currentQId) return;

    const currentAns = state.answers[currentQId];
    if (!currentAns) return;

    const newStatus: QuestionStatus =
      currentAns.status === "answered_marked" ? "marked" : "unanswered";

    const updatedAnswers: Record<string, AnswerState> = {
      ...state.answers,
      [currentQId]: {
        ...currentAns,
        selectedOption: null,
        status: newStatus,
      },
    };

    set({ answers: updatedAnswers });
    get().saveToLocalStorage();
  },

  markForReview: () => {
    const state = get();
    const currentQId = state.sections[state.currentSection]?.[state.currentIndex];
    if (!currentQId) return;

    const currentAns = state.answers[currentQId];
    const hasOption = Boolean(currentAns?.selectedOption);
    const newStatus: QuestionStatus = hasOption ? "answered_marked" : "marked";

    const updatedAnswers = {
      ...state.answers,
      [currentQId]: {
        ...currentAns,
        questionId: currentQId,
        status: newStatus,
        timeSpentSeconds: currentAns?.timeSpentSeconds || 0,
      },
    };

    set({ answers: updatedAnswers });
    get().saveToLocalStorage();
    get().nextQuestion();
  },

  saveAndNext: () => {
    const state = get();
    const currentQId = state.sections[state.currentSection]?.[state.currentIndex];
    if (!currentQId) return;

    const currentAns = state.answers[currentQId];
    const hasOption = Boolean(currentAns?.selectedOption);
    const newStatus: QuestionStatus = hasOption ? "answered" : "unanswered";

    const updatedAnswers = {
      ...state.answers,
      [currentQId]: {
        ...currentAns,
        questionId: currentQId,
        status: newStatus,
        timeSpentSeconds: currentAns?.timeSpentSeconds || 0,
      },
    };

    set({ answers: updatedAnswers });
    get().saveToLocalStorage();
    get().nextQuestion();
  },

  nextQuestion: () => {
    const state = get();
    const secList = state.sections[state.currentSection];
    if (!secList) return;

    if (state.currentIndex < secList.length - 1) {
      const nextIndex = state.currentIndex + 1;
      const nextQId = secList[nextIndex];
      const nextAns = state.answers[nextQId];

      const updatedAnswers = { ...state.answers };
      if (nextAns && nextAns.status === "not_visited") {
        updatedAnswers[nextQId] = { ...nextAns, status: "unanswered" };
      }

      set({ currentIndex: nextIndex, answers: updatedAnswers });
    } else {
      // Move to next section if available
      const currentSecIdx = SECTION_ORDER.indexOf(state.currentSection);
      if (currentSecIdx < SECTION_ORDER.length - 1) {
        const nextSec = SECTION_ORDER[currentSecIdx + 1];
        get().jumpToQuestion(nextSec, 0);
      }
    }
  },

  prevQuestion: () => {
    const state = get();
    if (state.currentIndex > 0) {
      set({ currentIndex: state.currentIndex - 1 });
    } else {
      const currentSecIdx = SECTION_ORDER.indexOf(state.currentSection);
      if (currentSecIdx > 0) {
        const prevSec = SECTION_ORDER[currentSecIdx - 1];
        const prevList = state.sections[prevSec];
        get().jumpToQuestion(prevSec, (prevList?.length || 1) - 1);
      }
    }
  },

  jumpToQuestion: (section: SectionType, index: number) => {
    const state = get();
    const targetQId = state.sections[section]?.[index];
    if (!targetQId) return;

    const targetAns = state.answers[targetQId];
    const updatedAnswers = { ...state.answers };

    if (targetAns && targetAns.status === "not_visited") {
      updatedAnswers[targetQId] = { ...targetAns, status: "unanswered" };
    }

    set({
      currentSection: section,
      currentIndex: index,
      answers: updatedAnswers,
    });
    get().saveToLocalStorage();
  },

  changeSection: (section: SectionType) => {
    get().jumpToQuestion(section, 0);
  },

  tick: () => {
    const state = get();
    if (state.isSubmitted || !state.isInitialized) return;

    const nextRemaining = Math.max(0, state.remainingSeconds - 1);
    const currentQId = state.sections[state.currentSection]?.[state.currentIndex];

    let updatedAnswers = state.answers;
    if (currentQId && state.answers[currentQId]) {
      const ans = state.answers[currentQId];
      updatedAnswers = {
        ...state.answers,
        [currentQId]: {
          ...ans,
          timeSpentSeconds: (ans.timeSpentSeconds || 0) + 1,
        },
      };
    }

    set({
      remainingSeconds: nextRemaining,
      answers: updatedAnswers,
    });

    // Periodically save state to local storage every 5 seconds or at 0
    if (nextRemaining % 5 === 0 || nextRemaining === 0) {
      get().saveToLocalStorage();
    }
  },

  setSubmitting: (val: boolean) => set({ isSubmitting: val }),
  setSubmitted: (val: boolean) => {
    set({ isSubmitted: val });
    if (val) {
      get().clearLocalStorage();
    }
  },

  saveToLocalStorage: () => {
    const state = get();
    if (!state.mockId || typeof window === "undefined") return;

    const payload = {
      mockId: state.mockId,
      attemptId: state.attemptId,
      currentSection: state.currentSection,
      currentIndex: state.currentIndex,
      answers: state.answers,
      remainingSeconds: state.remainingSeconds,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(`nbe_attempt_${state.mockId}`, JSON.stringify(payload));
    } catch (e) {
      console.warn("Could not save attempt state to localStorage:", e);
    }
  },

  restoreFromLocalStorage: (mockId: string) => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem(`nbe_attempt_${mockId}`);
      if (!raw) return false;

      const parsed = JSON.parse(raw);
      if (parsed && parsed.mockId === mockId && parsed.answers) {
        set({
          attemptId: parsed.attemptId || get().attemptId,
          currentSection: parsed.currentSection || "REASONING",
          currentIndex: typeof parsed.currentIndex === "number" ? parsed.currentIndex : 0,
          answers: { ...get().answers, ...parsed.answers },
          remainingSeconds:
            typeof parsed.remainingSeconds === "number"
              ? parsed.remainingSeconds
              : TOTAL_EXAM_SECONDS,
        });
        return true;
      }
    } catch (e) {
      console.warn("Could not restore attempt state from localStorage:", e);
    }
    return false;
  },

  clearLocalStorage: () => {
    const state = get();
    if (state.mockId && typeof window !== "undefined") {
      try {
        localStorage.removeItem(`nbe_attempt_${state.mockId}`);
      } catch (e) {
        console.warn("Could not clear localStorage:", e);
      }
    }
  },
}));
