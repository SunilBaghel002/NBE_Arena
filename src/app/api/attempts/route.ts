import { NextResponse } from "next/server";
import { getAttempts, getMocks } from "@/lib/db";

export async function GET() {
  try {
    const attempts = await getAttempts();
    const mocks = await getMocks();
    const mockMap = new Map(mocks.map((m) => [m.id, m]));

    const enriched = attempts.map((att) => ({
      ...att,
      mockTitle: mockMap.get(att.mockId)?.title || "NBE Mock Test",
    }));

    return NextResponse.json({ attempts: enriched }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/attempts:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch attempts" },
      { status: 500 }
    );
  }
}
