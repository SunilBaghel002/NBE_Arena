# AI WORKFLOW.md
## Hybrid Extraction & Vision LLM Pipeline Specification

---

## 1. Purpose & Strategy

This document defines the **Hybrid Extraction Pipeline** for converting SSC CHSL, SSC MTS, DSSSB, and official NBE 2015 PYQ PDFs into clean, section-classified MCQs in MongoDB Atlas.

### Hybrid Strategy Overview
To eliminate dependency on expensive proprietary APIs (e.g. standard paid OpenAI/Claude quotas) and ensure zero-cost / high-sustainability bulk extraction, we enforce a **two-path hybrid extraction engine**:

1. **Path A (Text-Layer PDF Pages):**
   - For PDFs containing extractable text layers, extract raw text directly.
   - Send raw structured text to fast, ultra-cheap/free text LLMs (**Groq** `llama-3.3-70b-versatile` / `llama-3.1-8b-instant` or OpenRouter text models).
2. **Path B (Scanned / Image Pages & Mathematical Stems):**
   - Render page to high-DPI image (150–200 DPI).
   - Send image to Multimodal Vision VLM (**OpenRouter Qwen2.5-VL** primary, **Google Gemini 2.0 Flash** fallback, or **Ollama Qwen2.5-VL** offline).

> [!IMPORTANT]
> **Groq Scope Restriction:**
> - **Groq is allowed for TEXT pages ONLY.**
> - **Groq is NOT used as primary for image vision extraction.**
> - All image vision extraction routes through OpenRouter Qwen2.5-VL / Gemini Flash / Ollama.

---

## 2. Supported Input PDFs

| Exam Source | Why Supported | Typical Format |
|-------------|---------------|----------------|
| SSC CHSL Tier-1 PYQ (2023/2022) | Exact 4-section pattern (25x4 or 50x4) | Text-layer + image figures |
| SSC MTS PYQ | High volume, clean arithmetic | Text-layer + scanned |
| DSSSB LDC / Junior Assistant | 200 Questions, exact syllabus twin | Scanned + text |
| NBE Junior Assistant 2015 Official | Benchmark paper | Scanned PDF |
| SSC Selection Post (Higher Secondary) | Direct syllabus match | Text-layer |

---

## 3. Provider Priority & Configuration

### 3.1 Vision VLM Provider Priority (Path B)

| Priority | Provider | Recommended Model | Free / Cheap Tier Benefit |
|----------|----------|-------------------|---------------------------|
| **1 (Primary)** | **OpenRouter** | `qwen/qwen-2.5-vl-7b-instruct` or `openai/gpt-4o-mini` | State-of-the-art vision at ultra-low/free cost |
| **2 (Fallback)**| **Google Gemini** | `gemini-2.0-flash` | Generous daily free tier quota (15 RPM / 1500 RPD) |
| **3 (Offline)** | **Ollama** | `qwen2.5-vl:7b` | 100% free, runs entirely offline locally |

### 3.2 Text LLM Provider Priority (Path A - Text Pages Only)

| Priority | Provider | Recommended Model | Notes |
|----------|----------|-------------------|-------|
| **1 (Primary)** | **Groq** | `llama-3.3-70b-versatile` / `llama-3.1-8b-instant` | Instantaneous (500+ tok/s), free tier |
| **2 (Fallback)**| **OpenRouter** | `meta-llama/llama-3.3-70b-instruct` | Fast secondary text parser |

---

## 4. Environment Configuration

All providers and models must be **100% environment-driven** (zero hardcoded strings in code):

```env
# ==========================================
# VISION PROVIDER CONFIGURATION (Path B - Images)
# ==========================================
# Options: 'openrouter' | 'gemini' | 'ollama' | 'openai'
VISION_PROVIDER=openrouter

# OpenRouter Configuration (Primary Vision)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_VISION_MODEL=qwen/qwen-2.5-vl-7b-instruct
OPENROUTER_FALLBACK_MODEL=openai/gpt-4o-mini

# Google Gemini Configuration (Fallback Vision)
GEMINI_API_KEY=AIzaSy...
GEMINI_VISION_MODEL=gemini-2.0-flash

# Ollama Local Configuration (Offline Vision)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_VISION_MODEL=qwen2.5-vl:7b

# ==========================================
# TEXT PROVIDER CONFIGURATION (Path A - Text Pages Only)
# ==========================================
# Options: 'groq' | 'openrouter' | 'ollama'
TEXT_PROVIDER=groq
GROQ_API_KEY=gsk_...
GROQ_TEXT_MODEL=llama-3.3-70b-versatile
```

---

## 5. End-to-End Hybrid Pipeline Flow

```text
Uploaded PDF (/admin)
       │
       ▼
[Page Layer Detector (pdf-pipeline.ts)]
       ├── If text layer density > 200 characters AND no complex diagrams ────────┐
       │                                                                         ▼
       │                                                          [Path A: Text Parser (text-extract.ts)]
       │                                                          - Extract raw page text
       │                                                          - Prompt Groq / Text LLM (temp = 0)
       │                                                          - Parse JSON questions
       │                                                                         │
       ▼                                                                         │
[Path B: Vision VLM (vision-extract.ts)]                                         │
- Render page to PNG (150–200 DPI)                                               │
- Base64 encode image                                                            │
- Call OpenRouter (Qwen2.5-VL) / Gemini Flash                                   │
- Parse JSON questions                                                           │
       │                                                                         │
       └───────────────────────────────┬─────────────────────────────────────────┘
                                       │
                                       ▼
                     [Section Classifier Fallback]
                     - Validate REASONING | GA | QUANT | ENGLISH
                     - Keyword scoring heuristic if section ambiguous
                                       │
                                       ▼
                     [NBE Quant Filter & Normalizer]
                     - Soft-filter heavy advanced geometry / trigonometry
                     - Normalize options (a, b, c, d)
                                       │
                                       ▼
                     [SHA-256 Deduplication Engine]
                     - Hash normalized question + options text
                     - Skip duplicate if already exists in MongoDB
                                       │
                                       ▼
                     [MongoDB Atlas Insertion (Question.ts)]
                     - Persist active questions
                     - Log extraction telemetry (provider, latencyMs, status)
```

---

## 6. Master Extraction Prompts (Temperature = 0)

### 6.1 Vision Extraction Prompt (Path B)

**System Message:**
```text
You are an expert Indian competitive exam question extractor (SSC CHSL, MTS, DSSSB, NBE).
Extract ALL multiple-choice questions from the provided page image.

STRICT OUTPUT RULES:
1. Return ONLY a valid JSON array. No markdown formatting, no backticks, no prose.
2. Each item must strictly follow the JSON schema.
3. Sections must be one of: "REASONING", "GA", "QUANT", "ENGLISH".
4. If the answer key is visible on page, set correctOption to "a", "b", "c", or "d". If not visible, set null.
5. If a question depends on a diagram or image you cannot describe in text, set hasImage to true.
6. Convert mathematical notation to clean plain text (e.g., x^2, 3/4, sqrt(16)).
```

**JSON Schema:**
```json
[
  {
    "section": "REASONING" | "GA" | "QUANT" | "ENGLISH",
    "questionText": "Full question text including options stems",
    "options": {
      "a": "Option A text",
      "b": "Option B text",
      "c": "Option C text",
      "d": "Option D text"
    },
    "correctOption": "a" | "b" | "c" | "d" | null,
    "explanation": "Brief explanation if provided",
    "hasImage": false,
    "confidence": "high" | "medium" | "low"
  }
]
```

---

## 7. Section Classifier Fallback

If the LLM returns an empty or invalid section, the pipeline applies a keyword heuristic scorer:

* **REASONING:** `analogy, series, coding, decoding, brother, sister, direction, north, south, syllogism, odd one out, mirror image, water image, paper folding, venn`
* **GA:** `constitution, article, amendment, dynasty, emperor, river, capital, national park, festival, census, who among, hormone, vitamin, president, treaty`
* **QUANT:** `percentage, profit, loss, discount, compound interest, simple interest, ratio, proportion, time and work, train, speed, boat, average, fraction, arithmetic`
* **ENGLISH:** `synonym, antonym, correctly spelt, error spotting, underlined, idiom, phrase, one word substitute, passive voice, indirect speech, cloze test`

---

## 8. Deduplication Logic

```text
normalizedText = lowercase(trim(strip_punctuation(questionText)))
normalizedOpts = lowercase(trim(options.a + options.b + options.c + options.d))
contentHash    = sha256(normalizedText + "::" + normalizedOpts)

if Question.exists({ contentHash }) -> SKIP (Duplicate)
else -> INSERT into MongoDB Atlas
```

---

## 9. Quant Syllabus Filtering (NBE Specific)

Per official NBEMS syllabus (*"arithmetic computation and basic algebra only"*):
- Soft-flag advanced geometry and high trigonometry: `\b(sin|cos|tan|cot|sec|cosec)\b`, `\btriangle ABC\b`, `\bcyclic quadrilateral\b`, `\bchord of circle\b`.
- Tag difficulty as `"HARD"` or set `isActive: false` so basic arithmetic dominates mock generation.

---

## 10. Fault Tolerance, Retries & Logging

1. **Strict JSON Parsing:** Parse with `JSON.parse()`. If malformed JSON is received, clean backticks/markdown fences and retry once with temperature 0.
2. **Rate Limit Handling:** On HTTP 429 / 402, automatically fall back to the secondary provider (e.g. OpenRouter $\to$ Gemini Flash).
3. **Telemetry Logging:** Log every page extraction event into `data/logs/extraction_telemetry.json` with:
   `{ timestamp, pdfName, pageNumber, provider, model, durationMs, questionsExtracted, success }`