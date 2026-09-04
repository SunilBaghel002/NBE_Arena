import { NextResponse } from "next/server";
import { getAttemptById, getMockById, saveAttemptAiAnalysis } from "@/lib/db";
import { generateSingleAttemptAnalysis } from "@/lib/ai-mentor";

export const dynamic = "force-dynamic";

/**
 * GET /api/results/[attemptId]/ai-analysis
 * ZERO TOKEN USAGE: Only checks and returns saved report from MongoDB Atlas.
 * Never calls external AI APIs on GET.
 */
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

    if (!attempt.score) {
      return NextResponse.json({ error: "Attempt score not calculated" }, { status: 400 });
    }

    if (attempt.aiAnalysis) {
      return NextResponse.json(
        { analysis: attempt.aiAnalysis, hasAnalysis: true, cached: true },
        { status: 200 }
      );
    }

    // No analysis exists yet; return null without consuming any AI tokens
    return NextResponse.json(
      { analysis: null, hasAnalysis: false },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/results/[attemptId]/ai-analysis:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load AI analysis" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/results/[attemptId]/ai-analysis
 * Triggered ONLY when candidate explicitly clicks "Generate AI Report".
 * Generates fresh analysis and persists to MongoDB Atlas.
 */
export async function POST(
  req: Request,
  { params }: { params: { attemptId: string } }
) {
  try {
    const { attemptId } = params;
    const attempt = await getAttemptById(attemptId);
    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (!attempt.score) {
      return NextResponse.json({ error: "Attempt score not calculated" }, { status: 400 });
    }

    // Generate fresh analysis on explicit request
    const mock = await getMockById(attempt.mockId);
    const analysis = await generateSingleAttemptAnalysis(attempt, mock?.title);

    // Cache permanently in MongoDB
    await saveAttemptAiAnalysis(attemptId, analysis);

    return NextResponse.json({ analysis, hasAnalysis: true, cached: false }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/results/[attemptId]/ai-analysis:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate AI analysis" },
      { status: 500 }
    );
  }
}
