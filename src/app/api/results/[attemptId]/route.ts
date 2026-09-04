import { NextResponse } from "next/server";
import { getAttemptById, getMockById, getQuestionsByIds } from "@/lib/db";
import { Question, AnswerState, SectionType, PaletteItem } from "@/types";
import { classifyTopic, getTopicLabel, analyzeAttemptTopics } from "@/lib/topic-classifier";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { attemptId: string } }
) {
  try {
    const { attemptId } = params;
    const url = new URL(req.url);
    const sectionParam = url.searchParams.get("section")?.toUpperCase() as SectionType | "ALL" | undefined;

    const attempt = await getAttemptById(attemptId);
    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    const mock = await getMockById(attempt.mockId);

    // Section question ID groupings (50 questions per section)
    const sectionMap: Record<SectionType, string[]> = {
      REASONING: mock?.sections?.REASONING || [],
      GA: mock?.sections?.GA || [],
      QUANT: mock?.sections?.QUANT || [],
      ENGLISH: mock?.sections?.ENGLISH || [],
    };

    // All 200 question IDs in canonical order
    const allMockQuestionIds = [
      ...sectionMap.REASONING,
      ...sectionMap.GA,
      ...sectionMap.QUANT,
      ...sectionMap.ENGLISH,
    ];

    const finalQuestionIds = allMockQuestionIds.length === 200
      ? allMockQuestionIds
      : attempt.answers.map((a) => a.questionId);

    // Determine which questions to fully hydrate with text, options & explanations
    let idsToHydrate = finalQuestionIds;
    if (sectionParam && sectionParam !== "ALL" && sectionMap[sectionParam]?.length > 0) {
      idsToHydrate = sectionMap[sectionParam];
    }

    // Query questions to hydrate
    const [hydratedQuestions, allMinimalQuestions] = await Promise.all([
      getQuestionsByIds(idsToHydrate),
      // If we only hydrated 50, fetch minimal metadata (id, section, correctOption) for palette if needed
      idsToHydrate.length === finalQuestionIds.length
        ? Promise.resolve([])
        : getQuestionsByIds(finalQuestionIds),
    ]);

    const fullQuestionMap = new Map<string, Question>(hydratedQuestions.map((q) => [q.id, q]));
    const allQuestionsList = allMinimalQuestions.length > 0 ? allMinimalQuestions : hydratedQuestions;
    const allQuestionMap = new Map<string, Question>(allQuestionsList.map((q) => [q.id, q]));
    const answerMap = new Map<string, AnswerState>(
      attempt.answers.map((a) => [a.questionId, a])
    );

    // Compute comprehensive topic-level weakness and mistake analysis across all 4 sections
    const topicAnalysis = analyzeAttemptTopics(allQuestionsList, attempt.answers, finalQuestionIds);

    // Build the 200-question lightweight navigation palette
    const palette: PaletteItem[] = finalQuestionIds.map((qId, idx) => {
      const q = allQuestionMap.get(qId);
      const ans = answerMap.get(qId);
      const selectedOption = ans?.selectedOption || null;
      const status = ans?.status || "not_visited";
      const isCorrect = q && selectedOption ? selectedOption === q.correctOption : false;

      // Determine section fallback by index (0-49: REASONING, 50-99: GA, 100-149: QUANT, 150-199: ENGLISH)
      const secFallback: SectionType =
        idx < 50 ? "REASONING" : idx < 100 ? "GA" : idx < 150 ? "QUANT" : "ENGLISH";

      const section = q?.section || secFallback;
      const topicKey = q ? classifyTopic(q) : undefined;
      const topicLabel = topicKey ? getTopicLabel(topicKey, section) : undefined;

      return {
        questionId: qId,
        questionNumber: idx + 1,
        section,
        topic: topicKey,
        topicLabel,
        status,
        selectedOption,
        isCorrect,
        timeSpentSeconds: ans?.timeSpentSeconds || 0,
      };
    });

    // Hydrate the review items for the requested question set (e.g. 50 items)
    const questionsWithReview = idsToHydrate.map((qId) => {
      const q = fullQuestionMap.get(qId);
      const ans = answerMap.get(qId);
      const selectedOption = ans?.selectedOption || null;
      const status = ans?.status || "not_visited";
      const isCorrect = q && selectedOption ? selectedOption === q.correctOption : false;

      return {
        questionId: qId,
        selectedOption,
        status,
        timeSpentSeconds: ans?.timeSpentSeconds || 0,
        question: q || null,
        isCorrect,
      };
    });

    return NextResponse.json(
      {
        attempt,
        mockTitle: mock?.title || "NBE Mock Test",
        activeSection: sectionParam || "ALL",
        palette,
        questionsWithReview,
        totalQuestions: finalQuestionIds.length,
        topicAnalysis,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/results/[attemptId]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load attempt results" },
      { status: 500 }
    );
  }
}
