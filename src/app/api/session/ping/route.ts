import { NextResponse } from "next/server";
import { updateSessionPing } from "@/lib/session-tracker";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, currentPage } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const updated = await updateSessionPing(sessionId, currentPage);
    return NextResponse.json({ success: updated }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/session/ping:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
