import fs from "fs";
import path from "path";
import { connectToDatabase } from "./mongodb";
import { QuestionModel } from "@/models/Question";
import { extractTextFromPdfBuffer, extractTextFromPdfFile, PdfPageText } from "./pdf-text";
import { textExtractor } from "./text-extract";
import { visionExtractor } from "./vision-extract";
import { classifySectionFallback } from "./section-classifier";
import { generateQuestionHash } from "./dedupe";
import { ExtractedQuestion, ExtractionPageResult } from "./providers/types";

export interface PipelineOptions {
  sourceExam?: string;
  sourceYear?: number;
  startPage?: number;
  endPage?: number;
  textProviderOverride?: string;
  visionProviderOverride?: string;
  forceVision?: boolean;
}

export interface PipelineSummary {
  pdfName: string;
  totalPages: number;
  processedPages: number;
  totalExtracted: number;
  totalInserted: number;
  totalDuplicates: number;
  pageResults: ExtractionPageResult[];
}

export async function logTelemetry(entry: any) {
  try {
    const logDir = path.join(process.cwd(), "data", "logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFile = path.join(logDir, "extraction_telemetry.json");

    let existing: any[] = [];
    if (fs.existsSync(logFile)) {
      try {
        existing = JSON.parse(fs.readFileSync(logFile, "utf-8"));
      } catch {
        existing = [];
      }
    }

    existing.push({
      timestamp: new Date().toISOString(),
      ...entry,
    });

    // Keep last 1000 records
    if (existing.length > 1000) {
      existing = existing.slice(-1000);
    }

    fs.writeFileSync(logFile, JSON.stringify(existing, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to log telemetry:", err);
  }
}

export async function processPdfExtraction(
  pdfBuffer: Buffer,
  pdfName: string,
  options: PipelineOptions = {}
): Promise<PipelineSummary> {
  await connectToDatabase();

  const sourceExam = options.sourceExam || pdfName.replace(/\.pdf$/i, "");
  const sourceYear = options.sourceYear || 2023;

  // 1. Extract text structure from PDF
  const textResult = await extractTextFromPdfBuffer(pdfBuffer);
  const totalPages = textResult.totalPages;

  const startPage = Math.max(1, options.startPage || 1);
  const endPage = Math.min(totalPages, options.endPage || totalPages);

  const pageResults: ExtractionPageResult[] = [];
  let totalExtracted = 0;
  let totalInserted = 0;
  let totalDuplicates = 0;

  for (let pNum = startPage; pNum <= endPage; pNum++) {
    const pageData: PdfPageText | undefined = textResult.pages.find((p) => p.pageNumber === pNum);
    const pageText = pageData?.text || "";
    const hasGoodTextLayer = pageText.length >= 100 && !options.forceVision;

    let extractedQuestions: ExtractedQuestion[] = [];
    let pageTelemetry: any = null;
    let mode: "text" | "vision" = "text";
    let isSuccess = true;
    let errorMsg: string | undefined;

    try {
      if (hasGoodTextLayer) {
        // Path A: Fast Text Extraction (Groq)
        mode = "text";
        const res = await textExtractor.extractPage(
          pageText,
          options.textProviderOverride
        );
        extractedQuestions = res.questions;
        pageTelemetry = res.telemetry;
      } else {
        // Path B: Vision Extraction Placeholder / Fallback
        mode = "vision";
        // If image rendering buffer is available:
        const res = await visionExtractor.extractPage(
          pageText, // Fallback if image rendering not invoked
          "image/png",
          options.visionProviderOverride
        );
        extractedQuestions = res.questions;
        pageTelemetry = res.telemetry;
      }
    } catch (err) {
      isSuccess = false;
      errorMsg = err instanceof Error ? err.message : "Extraction failed";
      pageTelemetry = {
        provider: hasGoodTextLayer ? "groq" : "openrouter",
        model: "unknown",
        mode,
        durationMs: 0,
      };
    }

    // 2. Validate, classify, deduplicate, and persist questions to MongoDB
    let newOnThisPage = 0;
    let dupesOnThisPage = 0;

    if (isSuccess && Array.isArray(extractedQuestions) && extractedQuestions.length > 0) {
      for (const q of extractedQuestions) {
        if (!q.questionText || !q.options || !q.options.a || !q.options.b) {
          continue; // Skip invalid structures
        }

        totalExtracted++;

        // Classify section with fallback heuristic
        const section = classifySectionFallback(
          q.questionText,
          `${q.options.a} ${q.options.b} ${q.options.c || ""} ${q.options.d || ""}`,
          q.section
        );

        // Normalize options
        const normalizedOptions = {
          a: String(q.options.a || "").trim(),
          b: String(q.options.b || "").trim(),
          c: String(q.options.c || "").trim(),
          d: String(q.options.d || "").trim(),
        };

        // Generate SHA-256 hash
        const contentHash = generateQuestionHash(q.questionText, normalizedOptions);

        // Check if duplicate in MongoDB Atlas
        const existing = await QuestionModel.findOne({ contentHash }).lean();

        if (existing) {
          dupesOnThisPage++;
          totalDuplicates++;
        } else {
          // Insert into MongoDB Atlas
          const customId = `ext_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await QuestionModel.create({
            id: customId,
            contentHash,
            section,
            questionText: q.questionText.trim(),
            options: normalizedOptions,
            correctOption: q.correctOption || null,
            explanation: q.explanation || "",
            hasImage: Boolean(q.hasImage),
            sourceExam,
            sourceYear,
            difficulty: "MEDIUM",
            isActive: true,
          });

          newOnThisPage++;
          totalInserted++;
        }
      }
    }

    const pageResult: ExtractionPageResult = {
      pageNumber: pNum,
      mode,
      success: isSuccess,
      questions: extractedQuestions,
      telemetry: {
        ...pageTelemetry,
        questionsFound: extractedQuestions.length,
        newInserted: newOnThisPage,
        duplicates: dupesOnThisPage,
      },
      error: errorMsg,
    };

    pageResults.push(pageResult);

    // Log telemetry
    await logTelemetry({
      pdfName,
      pageNumber: pNum,
      mode,
      provider: pageTelemetry?.provider,
      model: pageTelemetry?.model,
      durationMs: pageTelemetry?.durationMs,
      questionsFound: extractedQuestions.length,
      newInserted: newOnThisPage,
      duplicates: dupesOnThisPage,
      success: isSuccess,
      error: errorMsg,
    });
  }

  return {
    pdfName,
    totalPages,
    processedPages: endPage - startPage + 1,
    totalExtracted,
    totalInserted,
    totalDuplicates,
    pageResults,
  };
}
