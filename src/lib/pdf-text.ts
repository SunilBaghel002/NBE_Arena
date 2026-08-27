import fs from "fs";
import { extractText } from "unpdf";

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
  const uint8 = new Uint8Array(buffer);
  const { totalPages, text } = await extractText(uint8);

  const pageTexts: string[] = Array.isArray(text) ? text : [String(text || "")];
  const pages: PdfPageText[] = pageTexts.map((rawPageText: string, idx: number) => {
    const cleaned = (rawPageText || "").trim();
    return {
      pageNumber: idx + 1,
      text: cleaned,
      charCount: cleaned.length,
    };
  });

  return {
    totalPages: totalPages || pages.length,
    pages,
    fullText: pages.map((p) => p.text).join("\n\n"),
  };
}

export async function extractTextFromPdfFile(
  filePath: string
): Promise<PdfTextExtractionResult> {
  const buffer = await fs.promises.readFile(filePath);
  return extractTextFromPdfBuffer(buffer);
}
