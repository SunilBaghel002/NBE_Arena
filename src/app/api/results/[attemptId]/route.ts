import { NextResponse } from "next/server";
import { getAttemptById, getMockById, getQuestions } from "@/lib/db";
import { Question } from "@/types";

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

    // Attach full question details (including correctOption & explanation)
    const questionsWithReview = attempt.answers.map((ans) => {
      const q = questionMap.get(ans.questionId);
      return {
        questionId: ans.questionId,
        selectedOption: ans.selectedOption,
        status: ans.status,
        timeSpentSeconds: ans.timeSpentSeconds || 0,
        question: q || null,
        isCorrect: q ? ans.selectedOption === q.correctOption : false,
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
