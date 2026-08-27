import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAttempts, getMocks } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as unknown as { id: string }).id : undefined;

    const attempts = await getAttempts(userId);
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
