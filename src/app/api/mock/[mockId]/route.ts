import { NextResponse } from "next/server";
import { getMockById, getQuestionsByIds } from "@/lib/db";
import { HydratedMockTest, HydratedQuestion } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { mockId: string } }
) {
  try {
    const { mockId } = params;
    const mock = await getMockById(mockId);

    if (!mock) {
      return NextResponse.json({ error: "Mock test not found" }, { status: 404 });
    }

    const allIds = [
      ...mock.sections.REASONING,
      ...mock.sections.GA,
      ...mock.sections.QUANT,
      ...mock.sections.ENGLISH,
    ];

    // High-speed targeted query for only the 200 questions in this mock test
    const questions = await getQuestionsByIds(allIds);
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    const hydratedQuestions: Record<string, HydratedQuestion> = {};

    for (const qId of allIds) {
      const q = questionMap.get(qId);
      if (q) {
        // Strip correctOption for candidate CBT session security
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { correctOption, ...safeQuestion } = q;
        hydratedQuestions[qId] = safeQuestion;
      }
    }

    const responseData: HydratedMockTest = {
      id: mock.id,
      title: mock.title,
      createdAt: mock.createdAt,
      timeLimitMinutes: mock.timeLimitMinutes,
      totalQuestions: mock.totalQuestions,
      questions: hydratedQuestions,
      sections: mock.sections,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/mock/[mockId]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load mock test" },
      { status: 500 }
    );
  }
}
