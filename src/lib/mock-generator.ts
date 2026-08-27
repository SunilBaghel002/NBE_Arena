import { Question, MockTest, SectionType } from "@/types";
import { getQuestions, getMocks, saveMock } from "./db";

// Fisher-Yates shuffle helper
function sampleRandom<T>(array: T[], n: number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

function isBloodRelationQuestion(q: Question): boolean {
  const text = `${q.questionText} ${q.options.a} ${q.options.b} ${q.options.c} ${q.options.d}`.toLowerCase();
  if (/father of the nation|father of modern|presently \d+ times his/i.test(text)) {
    return false;
  }
  return (
    /how is [a-z]+ related to/i.test(text) ||
    /pointing to a (?:man|woman|photograph|person)/i.test(text) ||
    /(?:father|mother|sister|brother|son|daughter|husband|wife) of/i.test(text) ||
    /[a-z]’s (?:father|mother|sister|brother|son|daughter|husband|wife)/i.test(text) ||
    /is the (?:father|mother|sister|brother|son|daughter|husband|wife)/i.test(text) ||
    /[A-Za-z0-9]\s*[@#%&*+\-×÷$=]\s*[A-Za-z0-9].*?(?:father|mother|sister|brother|son|daughter|husband|wife)/i.test(text)
  );
}

export async function generateMockTest(customTitle?: string): Promise<MockTest> {
  const allQuestions = await getQuestions();
  const activeQuestions = allQuestions.filter((q) => q.isActive);

  const pools: Record<SectionType, Question[]> = {
    REASONING: activeQuestions.filter((q) => q.section === "REASONING"),
    GA: activeQuestions.filter((q) => q.section === "GA"),
    QUANT: activeQuestions.filter((q) => q.section === "QUANT"),
    ENGLISH: activeQuestions.filter((q) => q.section === "ENGLISH"),
  };

  const requiredPerSection = 50;
  const sections: SectionType[] = ["REASONING", "GA", "QUANT", "ENGLISH"];

  for (const section of sections) {
    if (pools[section].length < requiredPerSection) {
      throw new Error(
        `Insufficient questions in ${section}. Found ${pools[section].length}, but at least ${requiredPerSection} are required.`
      );
    }
  }

  // Reasoning Blueprint: Exactly 3 Blood Relations + 47 non-blood reasoning
  const bloodPool = pools.REASONING.filter(isBloodRelationQuestion);
  const nonBloodReasoningPool = pools.REASONING.filter((q) => !isBloodRelationQuestion(q));

  const selectedBlood = sampleRandom(bloodPool, Math.min(3, bloodPool.length));
  const remainingReasoningCount = 50 - selectedBlood.length;
  const selectedNonBlood = sampleRandom(nonBloodReasoningPool, remainingReasoningCount);
  const balancedReasoning = sampleRandom([...selectedBlood, ...selectedNonBlood], 50);

  const existingMocks = await getMocks();
  const mockNumber = existingMocks.length + 1;
  const title = customTitle || `NBE Junior Assistant Full Mock #${mockNumber}`;
  const mockId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const mock: MockTest = {
    id: mockId,
    title,
    createdAt: new Date().toISOString(),
    timeLimitMinutes: 180,
    totalQuestions: 200,
    sections: {
      REASONING: balancedReasoning.map((q) => q.id),
      GA: sampleRandom(pools.GA, 50).map((q) => q.id),
      QUANT: sampleRandom(pools.QUANT, 50).map((q) => q.id),
      ENGLISH: sampleRandom(pools.ENGLISH, 50).map((q) => q.id),
    },
  };

  await saveMock(mock);
  return mock;
}
