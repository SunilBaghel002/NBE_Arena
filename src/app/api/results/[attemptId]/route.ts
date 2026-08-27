import { NextResponse } from "next/server";
import { getAttemptById, getMockById, getQuestions } from "@/lib/db";
import { Question, AnswerState } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { attemptId: string } }
) {
  try {
    const { attemptId } = params;
    const attempt = await getAttemptById(attemptId);

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    const mock = await getMockById(attempt.mockId);
    const allQuestions = await getQuestions();
    const questionMap = new Map<string, Question>(allQuestions.map((q) => [q.id, q]));
    const answerMap = new Map<string, AnswerState>(
      attempt.answers.map((a) => [a.questionId, a])
    );

    // Get all 200 question IDs from the mock test in order
    const mockQuestionIds = mock
      ? [
          ...mock.sections.REASONING,
          ...mock.sections.GA,
          ...mock.sections.QUANT,
          ...mock.sections.ENGLISH,
        ]
      : attempt.answers.map((a) => a.questionId);

    // Attach full question details (including correctOption & explanation) for all 200 questions
    const questionsWithReview = mockQuestionIds.map((qId) => {
      const q = questionMap.get(qId);
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
        questionsWithReview,
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
