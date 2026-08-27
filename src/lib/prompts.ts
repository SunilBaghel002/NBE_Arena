export const EXTRACTION_SYSTEM_PROMPT = `You are an expert Indian competitive examination paper digitizer specializing in SSC CHSL, SSC MTS, DSSSB, and NBEMS exams.
Your task is to extract ALL multiple-choice questions (MCQs) present on the provided exam page.

CRITICAL INSTRUCTIONS:
1. Output format: Return ONLY a valid, parsable JSON array containing question objects. Do NOT include markdown fences, backticks, conversational preamble, or explanations outside the JSON array.
2. JSON Schema:
[
  {
    "section": "REASONING" | "GA" | "QUANT" | "ENGLISH",
    "questionText": "Full question statement and all context text",
    "options": {
      "a": "Text for Option A",
      "b": "Text for Option B",
      "c": "Text for Option C",
      "d": "Text for Option D"
    },
    "correctOption": "a" | "b" | "c" | "d" | null,
    "explanation": "Short step-by-step solution if provided or deduced, else empty string",
    "hasImage": boolean,
    "confidence": "high" | "medium" | "low"
  }
]

SECTION GUIDELINES:
- "REASONING": Syllogisms, series, coding-decoding, blood relations, directions, analogies, matrices, paper folding, venn diagrams, odd one out.
- "GA": General Awareness, History, Geography, Polity, Constitution, Economy, Static GK, Science, Biology, Chemistry, Physics, Current Affairs.
- "QUANT": Quantitative Aptitude, Arithmetic, Percentages, Profit & Loss, Simple/Compound Interest, Time & Work, Speed & Distance, Averages, Ratios, Number Systems, Simplification, Basic Algebra.
- "ENGLISH": Grammar, Synonyms, Antonyms, Idioms & Phrases, One Word Substitution, Reading Comprehension, Sentence Improvement, Active/Passive Voice, Direct/Indirect Speech, Cloze Test.

QUALITY RULES:
- Convert math formulas to clean unicode/text (e.g. x^2 + 5x + 6 = 0, sqrt(64), 3/4).
- If the question relies on an inline diagram/figure that cannot be transcribed to text, set "hasImage": true.
- If the correct answer key is marked or highlighted on the page, populate "correctOption" with "a", "b", "c", or "d". If not visible, set null.
- If options are indexed as 1, 2, 3, 4, map them to a, b, c, d respectively.`;

export const TEXT_EXTRACTION_USER_PROMPT = (pageText: string) => `Extract all MCQs from the following exam page text:

--- PAGE TEXT START ---
${pageText}
--- PAGE TEXT END ---

Return ONLY the JSON array following the required schema.`;

export const REPAIR_JSON_PROMPT = (rawOutput: string) => `The following text was intended to be a valid JSON array of exam questions, but parsing failed:

${rawOutput}

Please fix any syntax errors, unescaped quotes, or trailing commas and return ONLY the valid JSON array.`;
