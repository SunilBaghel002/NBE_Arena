import { SectionType } from "@/types";

export interface ExtractedQuestion {
  section: SectionType;
  questionText: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctOption: "a" | "b" | "c" | "d" | null;
  explanation?: string;
  hasImage?: boolean;
  confidence?: "high" | "medium" | "low";
}

export interface ExtractionTelemetry {
  provider: string;
  model: string;
  mode: "text" | "vision";
  durationMs: number;
  promptTokens?: number;
  completionTokens?: number;
  rawResponse?: string;
}

export interface ExtractionPageResult {
  pageNumber: number;
  mode: "text" | "vision";
  success: boolean;
  questions: ExtractedQuestion[];
  telemetry: ExtractionTelemetry;
  error?: string;
}

export interface IVisionProvider {
  readonly name: string;
  readonly defaultModel: string;
  extractFromImage(
    base64Image: string,
    mimeType?: string,
    modelOverride?: string
  ): Promise<{
    questions: ExtractedQuestion[];
    telemetry: ExtractionTelemetry;
  }>;
}

export interface ITextProvider {
  readonly name: string;
  readonly defaultModel: string;
  extractFromText(
    pageText: string,
    modelOverride?: string
  ): Promise<{
    questions: ExtractedQuestion[];
    telemetry: ExtractionTelemetry;
  }>;
}
