import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { getMockById, getQuestions, saveAttempt } from "@/lib/db";
import { calculateAttemptScore } from "@/lib/scoring";
import { Attempt } from "@/types";

const SubmitAnswerSchema = z.object({
  questionId: z.string(),
  selectedOption: z.enum(["a", "b", "c", "d"]).nullable(),
  status: z.enum(["answered", "marked", "answered_marked", "not_visited", "unanswered"]),
  timeSpentSeconds: z.number().optional(),
});

const SubmitSchema = z.object({
  mockId: z.string(),
  attemptId: z.string(),
  timeTakenSeconds: z.number().int().nonnegative(),
  answers: z.array(SubmitAnswerSchema),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as unknown as { id: string }).id : undefined;
    const userName = session?.user?.name || "Candidate";

    const rawBody = await req.json();
    const parsed = SubmitSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { mockId, attemptId, timeTakenSeconds, answers } = parsed.data;

    const mock = await getMockById(mockId);
    if (!mock) {
      return NextResponse.json({ error: "Mock test not found" }, { status: 404 });
    }

    const allQuestions = await getQuestions();
    const questionMap = new Map(allQuestions.map((q) => [q.id, q]));

    const mockQuestionIds = [
      ...mock.sections.REASONING,
      ...mock.sections.GA,
      ...mock.sections.QUANT,
      ...mock.sections.ENGLISH,
    ];

    const mockQuestions = mockQuestionIds
      .map((id) => questionMap.get(id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q));

    // Calculate score with negative marking
    const score = calculateAttemptScore(mockQuestions, answers, timeTakenSeconds);

    const attempt: Attempt = {
      id: attemptId,
      userId,
      userName,
      mockId,
      mockTitle: mock.title,
      startedAt: new Date(Date.now() - timeTakenSeconds * 1000).toISOString(),
      submittedAt: new Date().toISOString(),
      timeTakenSeconds,
      answers,
      score,
    };

    await saveAttempt(attempt);

    return NextResponse.json(
      {
        success: true,
        attemptId: attempt.id,
        mockId: attempt.mockId,
        score,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/submit:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit attempt" },
      { status: 500 }
    );
  }
}
