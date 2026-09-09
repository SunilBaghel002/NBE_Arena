import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { closeSession } from "@/lib/session-tracker";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let targetSessionId: string | undefined;

    // Check request body first
    try {
      const body = await req.json();
      if (body?.sessionId) {
        targetSessionId = body.sessionId;
      }
    } catch {
      // Body may be empty on beacon
    }

    // Fallback to NextAuth token/session
    if (!targetSessionId) {
      const session = await getServerSession(authOptions);
      targetSessionId = (session?.user as unknown as { sessionId?: string })?.sessionId;
    }

    if (targetSessionId) {
      await closeSession(targetSessionId);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/session/logout:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
