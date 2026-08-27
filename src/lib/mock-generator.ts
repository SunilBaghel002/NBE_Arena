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
      REASONING: sampleRandom(pools.REASONING, 50).map((q) => q.id),
      GA: sampleRandom(pools.GA, 50).map((q) => q.id),
      QUANT: sampleRandom(pools.QUANT, 50).map((q) => q.id),
      ENGLISH: sampleRandom(pools.ENGLISH, 50).map((q) => q.id),
    },
  };

  await saveMock(mock);
  return mock;
}
