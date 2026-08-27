import { NextResponse } from "next/server";
import { z } from "zod";
import { generateMockTest } from "@/lib/mock-generator";

const GenerateMockSchema = z.object({
  title: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    const parsed = GenerateMockSchema.safeParse(body);
    const title = parsed.success ? parsed.data.title : undefined;

    const mock = await generateMockTest(title);

    return NextResponse.json(
      {
        success: true,
        mockId: mock.id,
        title: mock.title,
        totalQuestions: mock.totalQuestions,
        timeLimitMinutes: mock.timeLimitMinutes,
        questionCounts: {
          REASONING: mock.sections.REASONING.length,
          GA: mock.sections.GA.length,
          QUANT: mock.sections.QUANT.length,
          ENGLISH: mock.sections.ENGLISH.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/generate-mock:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate mock test" },
      { status: 400 }
    );
  }
}
