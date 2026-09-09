/**
 * Question & Option Text Sanitization Engine
 * Strips response-sheet artifacts, OCR noise, and exam paper headers
 * from question stems and options.
 */

/**
 * Sanitizes question stem text to remove exam paper headers, page headers,
 * shift titles, and section title boilerplate.
 */
export function sanitizeQuestionStem(text: string): string {
  if (!text || typeof text !== "string") return text || "";

  let cleaned = text;

  // 1. Remove combined exam + section header line:
  // e.g. "SSC CHSL 2023 Tier 1 August 8 Shift 1 Question Paper with Answers Section : English Language\n\n..."
  // or "Combined Higher Secondary Level Examination 2024 Tier I Section : English Language\n\n..."
  cleaned = cleaned.replace(
    /^(?:(?:SSC\s+CHSL|Combined Higher Secondary Level Examination|SSC\s+MTS|SSC\s+CGL|NBEMS)[\s\S]*?(?:Question Paper with Answers\s*)?)?Section\s*:\s*(?:English Language|General Intelligence(?: & Reasoning)?|General Awareness|Quantitative Aptitude)\s*/i,
    ""
  );

  // 2. Remove standalone exam paper headers if no "Section:" keyword
  cleaned = cleaned.replace(
    /^(?:SSC\s+CHSL|SSC\s+MTS|SSC\s+CGL|Combined Higher Secondary Level Examination)\s+\d{4}\s+Tier\s*[1I]\s+[^\n\.\?]*Shift\s*\d+\s+Question Paper with Answers\s*/i,
    ""
  );

  // 3. Remove standalone "Section : <name>" line
  cleaned = cleaned.replace(
    /^Section\s*:\s*(?:English(?: Language)?|General (?:Intelligence|Awareness|Knowledge)(?: & Reasoning)?|Quantitative Aptitude|Mathematics)\s*/i,
    ""
  );

  cleaned = cleaned.trim();
  // If the stem was only the section title and has nothing left except dots or empty string, fallback to "[figure]"
  if (!cleaned || cleaned === "...") {
    return "[figure]";
  }

  return cleaned;
}

/**
 * Sanitizes option text to remove response sheet metadata:
 * - "Question ID : 264330150779 Status : Answered Chosen Option : 3"
 * - "Question ID : 264330149477 Status : Not Answered Chosen Option : --"
 * - "Status : Answered Chosen Option : 1"
 */
export function sanitizeOptionText(text: string): string {
  if (!text || typeof text !== "string") return text || "";

  return text
    // Remove "Question ID : 12345 Status : Answered Chosen Option : 1"
    .replace(/\s*Question\s*ID\s*:\s*\d+.*$/i, "")
    .replace(/\s*Status\s*:\s*(?:Answered|Not Answered|Marked for Review)?\s*Chosen Option\s*:\s*.*$/i, "")
    // Remove standalone fragments if placed differently
    .replace(/\s*Question\s*ID\s*:\s*\d+/gi, "")
    .replace(/\s*Status\s*:\s*(?:Answered|Not Answered|Marked for Review)/gi, "")
    .replace(/\s*Chosen\s*Option\s*:\s*[\d\-]+/gi, "")
    .trim();
}

/**
 * Sanitizes a complete question object (stem and all 4 options).
 */
export function sanitizeQuestion<T extends { questionText: string; options: Record<string, string> }>(q: T): T {
  const cleanedOptions: Record<string, string> = {};
  for (const [key, val] of Object.entries(q.options || {})) {
    cleanedOptions[key] = sanitizeOptionText(val);
  }

  return {
    ...q,
    questionText: sanitizeQuestionStem(q.questionText),
    options: cleanedOptions,
  };
}
