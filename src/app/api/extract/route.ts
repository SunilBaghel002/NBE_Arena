import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { processPdfExtraction } from "@/lib/pdf-pipeline";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      filePath,
      pdfName,
      sourceExam,
      sourceYear,
      startPage,
      endPage,
      textProviderOverride,
      visionProviderOverride,
      forceVision,
    } = body;

    let targetBuffer: Buffer;
    let resolvedName = pdfName || "Exam_Paper.pdf";

    if (filePath) {
      // Resolve path safely relative to workspace
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);

      if (!fs.existsSync(absolutePath)) {
        return NextResponse.json(
          { error: `File not found: ${filePath}` },
          { status: 404 }
        );
      }

      targetBuffer = await fs.promises.readFile(absolutePath);
      resolvedName = path.basename(absolutePath);
    } else {
      return NextResponse.json(
        { error: "No filePath provided for extraction" },
        { status: 400 }
      );
    }

    const summary = await processPdfExtraction(targetBuffer, resolvedName, {
      sourceExam: sourceExam || resolvedName.replace(/\.pdf$/i, ""),
      sourceYear: Number(sourceYear) || 2023,
      startPage: startPage ? Number(startPage) : 1,
      endPage: endPage ? Number(endPage) : undefined,
      textProviderOverride,
      visionProviderOverride,
      forceVision: Boolean(forceVision),
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error("PDF Extraction API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "PDF extraction failed" },
      { status: 500 }
    );
  }
}
