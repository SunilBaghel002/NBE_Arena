# AI WORKFLOW.md
## Vision LLM Extraction & Classification Workflow

---

## 1. Purpose

This document defines exactly how the AI agent (and the app) must use Vision LLMs to convert raw exam PDFs into clean, section-tagged questions for the NBE mock engine.

**Plain OCR (Tesseract alone) is FORBIDDEN as primary extractor.**
Use Vision LLM multimodal understanding.

---

## 2. Supported Input PDFs

| Exam | Why allowed |
|------|-------------|
| SSC CHSL Tier-1 PYQ | Exact 4-section pattern |
| SSC CGL Tier-1 PYQ | Same sections; filter hard Quant |
| SSC MTS PYQ | Slightly easier; good volume |
| DSSSB LDC / Junior Assistant / Grade IV | Often 200-Q pattern; closest twin |
| SSC Selection Post (Matric/HS) | Syllabus aligned |

**Avoid:** SSC CGL Tier-2, Bank PO mains, CAT — wrong difficulty/pattern.

---

## 3. End-to-End AI Pipeline
PDF file
→ validate (is PDF, size < 50MB, pages < 100)
→ render pages to PNG (150–200 DPI, grayscale OK)
→ for each page:
→ build Vision prompt (system + user)
→ call Vision LLM
→ parse JSON response
→ validate schema
→ classify/confirm section
→ normalize options (a,b,c,d)
→ detect answer key if present
→ dedupe against existing bank
→ insert new questions
→ return extraction report

text


---

## 4. Page Rendering Rules

- DPI: **150 minimum**, 200 preferred
- Format: PNG
- If page is double-column, still send full page (LLM handles layout)
- Skip pure blank pages
- Do not crop aggressively — keep question numbers visible

---

## 5. Vision LLM Provider Priority

| Priority | Provider | Model | Notes |
|----------|----------|-------|-------|
| 1 | OpenAI | `gpt-4o` | Best JSON reliability |
| 2 | Anthropic | `claude-3-5-sonnet` | Excellent long pages |
| 3 | Google | `gemini-1.5-flash` | Cheap + fast fallback |

Implement provider via env:
VISION_PROVIDER=openai
OPENAI_API_KEY=...

or ANTHROPIC_API_KEY / GOOGLE_API_KEY
text


---

## 6. Master Extraction Prompt

### System Message
You are a precise exam-paper digitizer for Indian competitive exams (SSC, DSSSB).
Extract every multiple-choice question from the page image.

OUTPUT RULES:

Return ONLY a JSON array. No markdown fences. No prose.
Each item must match the schema exactly.
If you cannot read a question confidently, omit it.
If options are missing, omit the question.
correctOption may be null if answer key not visible on this page.
Use section values exactly: REASONING, GA, QUANT, ENGLISH
Convert math to plain text (example: x^2, 3/4, sqrt(16), pi*r^2)
Keep original option order.
text


### User Message (per page)
Extract all MCQs from this exam page.

Schema:
[{
"section": "REASONING"|"GA"|"QUANT"|"ENGLISH",
"questionText": string,
"options": {"a":string,"b":string,"c":string,"d":string},
"correctOption": "a"|"b"|"c"|"d"|null,
"hasImage": boolean,
"confidence": "high"|"medium"|"low"
}]

Section guide:

REASONING: analogies, series, coding, blood relation, direction, syllogism, non-verbal, puzzles
GA: history, geography, polity, economy, science, current affairs, static GK
QUANT: arithmetic, percentage, ratio, SI/CI, profit loss, time work, speed, averages, elementary algebra
ENGLISH: grammar, vocab, RC, error spotting, cloze, idioms, voice, narration
Flag hasImage=true if question depends on a figure/diagram.

text


---

## 7. Answer Key Handling

Many PYQ PDFs have separate answer key pages.

**Strategy A (preferred):**
- During extraction, if page looks like answer key (patterns like `1-b 2-a 3-c`), parse into map `{questionNumber: option}`
- Store temporarily keyed by source PDF
- After all pages, merge keys onto questions missing `correctOption`

**Strategy B:**
- Allow questions with `correctOption: null` into bank
- On results screen, mark "Answer key unavailable" for those
- Admin can manually set later (optional enhancement)

**Minimum viable:** Strategy B is acceptable for v1 if Strategy A is complex.

---

## 8. Section Classifier Fallback

If LLM returns wrong/missing section, apply keyword heuristic:
REASONING keywords: analogy, series, coding, brother, mother, direction, north, syllogism, odd one out, mirror, water image, venn
GA keywords: capital, river, constitution, article, who among, invented, festival, currency, census, cabinet
QUANT keywords: percent, profit, loss, interest, average, ratio, train, boat, work, days, speed, fraction, algebra
ENGLISH keywords: synonym, antonym, error, underlined, passage, idiom, improve the sentence, fill in the blank, voice, narration

text


Score keyword hits; assign max scoring section. If tie, keep LLM label or mark `GA` as last resort.

---

## 9. Deduplication Logic
normalize(text) = lowercase → remove punctuation → collapse spaces
hash = sha256(normalize(questionText) + normalize(options.a+b+c+d))

if hash exists in bank → skip (duplicate)
if levenshtein similarity > 0.92 with existing → skip (near-duplicate)
else insert

text


---

## 10. Quant Filtering (NBE-specific)

NBE syllabus: *"not on complicated arithmetical computation"* and focuses on arithmetic + basic algebra.

During insert:
if section == QUANT and matches(advanced_geometry_or_trigo_regex):
tag difficulty = HARD
optionally set isActive = false for first version

text


Keywords to soft-flag:
`sin, cos, tan, cot, sec, cosec, height and distance, triangle ABC, circle radius chord, coordinate geometry`

Do **not** delete arithmetic word problems.

---

## 11. Error Handling & Retries

| Error | Action |
|-------|--------|
| LLM rate limit | Wait 5s, retry up to 3 times |
| Invalid JSON | Re-prompt once: "Return valid JSON only" |
| Empty array on content page | Retry with higher detail prompt once |
| Provider outage | Switch to fallback provider if configured |
| Corrupt PDF | Return user-friendly error; do not crash server |

Log every page result:
{ pdfId, page, status, questionsFound, latencyMs, error? }

text


---

## 12. Cost Control

- Prefer Gemini Flash or GPT-4o-mini **only if quality acceptable**; default GPT-4o for accuracy
- Don't re-extract already processed pdfId
- Allow "extract pages 1–5 only" debug mode for testing
- Show estimated pages × cost warning in admin (optional)

---

## 13. Quality Gate Before Mock Generation

A mock may be generated only if:
count(REASONING, isActive) >= 50
count(GA, isActive) >= 50
count(QUANT, isActive) >= 50
count(ENGLISH, isActive) >= 50

text


Optional stricter gate for better mocks:
questions with correctOption != null >= 80% of bank

text


---

## 14. AI Agent Implementation Notes (For Anti-Gravity IDE)

When implementing:
1. Create `src/lib/vision-extract.ts` with provider adapters
2. Create `src/lib/pdf-to-images.ts`
3. Create `src/lib/section-classifier.ts`
4. Create `src/lib/dedupe.ts`
5. Wire `POST /api/extract` to run pipeline async-ish with progress
6. NEVER call Vision LLM from client components
7. Store raw LLM responses in `/data/logs/` for debugging first 2 PDFs
8. Write a script `npm run extract:sample` for CLI testing one PDF