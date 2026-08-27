import fs from "fs";
// @ts-ignore
import { PDFParse } from "pdf-parse";

export interface PdfPageText {
  pageNumber: number;
  text: string;
  charCount: number;
}

export interface PdfTextExtractionResult {
  totalPages: number;
  pages: PdfPageText[];
  fullText: string;
}

export async function extractTextFromPdfBuffer(
  buffer: Buffer
): Promise<PdfTextExtractionResult> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();

  const totalPages = result.total || (result.pages ? result.pages.length : 1);
  const pages: PdfPageText[] = (result.pages || []).map((p: any, idx: number) => {
    const rawText = p.text || "";
    return {
      pageNumber: idx + 1,
      text: rawText.trim(),
      charCount: rawText.trim().length,
    };
  });

  return {
    totalPages,
    pages,
    fullText: result.text || "",
  };
}

export async function extractTextFromPdfFile(
  filePath: string
): Promise<PdfTextExtractionResult> {
  const buffer = await fs.promises.readFile(filePath);
  return extractTextFromPdfBuffer(buffer);
}
