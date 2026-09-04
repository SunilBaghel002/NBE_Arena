import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAttempts, getMocks, getUserAiReport, saveUserAiReport } from "@/lib/db";
import { generateMultiMockAnalysis } from "@/lib/ai-mentor";

export const dynamic = "force-dynamic";

/**
 * GET /api/analytics/ai-report
 * ZERO TOKEN USAGE: Only returns existing cached report from MongoDB Atlas.
 * Never calls AI models on GET.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const queryUserId = url.searchParams.get("userId");

    const userId = session?.user
      ? (session.user as unknown as { id: string }).id
      : queryUserId || undefined;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cachedReport = await getUserAiReport(userId);
    if (cachedReport) {
      return NextResponse.json(
        { report: cachedReport, hasReport: true, cached: true },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { report: null, hasReport: false },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/analytics/ai-report:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load multi-mock report" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/ai-report
 * Triggered ONLY when candidate explicitly clicks "Generate Multi-Mock Strategic Report".
 * Generates fresh longitudinal analysis across all completed mocks and saves to MongoDB Atlas.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const queryUserId = url.searchParams.get("userId");

    const userId = session?.user
      ? (session.user as unknown as { id: string }).id
      : queryUserId || undefined;

    const candidateName = session?.user?.name || "Candidate";

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attempts = await getAttempts(userId);
    const attemptsWithScores = attempts.filter((a) => a.score);

    if (attemptsWithScores.length === 0) {
      return NextResponse.json(
        { error: "No completed mock attempts found for candidate." },
        { status: 400 }
      );
    }

    const mocks = await getMocks();
    const mockMap = new Map(mocks.map((m) => [m.id, m]));

    const enriched = attemptsWithScores.map((att) => ({
      ...att,
      mockTitle: mockMap.get(att.mockId)?.title || "NBE Full Mock",
    }));

    const analysis = await generateMultiMockAnalysis(candidateName, enriched);

    // Save to user profile in MongoDB
    await saveUserAiReport(userId, analysis);

    return NextResponse.json(
      { report: analysis, hasReport: true, cached: false },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/analytics/ai-report:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate multi-mock report" },
      { status: 500 }
    );
  }
}
