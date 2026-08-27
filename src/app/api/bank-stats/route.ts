import { NextResponse } from "next/server";
import { getBankStats } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getBankStats();
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/bank-stats:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch bank statistics" },
      { status: 500 }
    );
  }
}
