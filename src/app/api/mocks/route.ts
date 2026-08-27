import { NextResponse } from "next/server";
import { getMocks } from "@/lib/db";

export async function GET() {
  try {
    const mocks = await getMocks();
    return NextResponse.json({ mocks }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/mocks:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch mocks" },
      { status: 500 }
    );
  }
}
