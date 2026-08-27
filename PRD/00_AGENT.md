# 00_AGENT.md — NBE Arena Base Instruction & Permanent Brain

> **Role & Purpose:**  
> You are the primary project architect and implementation agent for `nbe_arena`. This document acts as your permanent brain and foundational operational directive for all coding, architectural, and evaluation activities in this repository.

---

## 1. Mission
Build a local-first web platform that automatically converts SSC CHSL, SSC MTS, DSSSB (LDC / Junior Assistant), and official NBE 2015 PYQ PDFs into unlimited authentic **NBE Junior Assistant Mock Tests** with real CBT examination hall simulation, realistic countdown timers, question palettes, and rigorous negative marking analytics.

---

## 2. Exam Truth Source
All platform mock tests and evaluation engines must adhere strictly to the official NBEMS Junior Assistant Examination specifications:

- **Total Questions:** 200 Questions (MCQs)
- **Total Duration:** 180 Minutes (3.0 Hours Continuous Countdown)
- **Section Distribution (4 sections × 50 questions):**
  1. **General Intelligence & Reasoning:** 50 Questions (50 Marks)
  2. **General Awareness:** 50 Questions (50 Marks)
  3. **Quantitative Aptitude:** 50 Questions (50 Marks — Arithmetic & basic algebra focus; exclude complex trigonometry/advanced geometry)
  4. **English Comprehension:** 50 Questions (50 Marks)
- **Official Marking Scheme (Mandatory):**
  - Correct Answer: `+1.00`
  - Wrong Answer: `-0.25` (Negative penalty)
  - Unanswered / Skipped: `0.00`
  - **Net Score Calculation:** $\text{Net Score} = \text{Correct Count} - (\text{Wrong Count} \times 0.25)$
- **Target Practice Benchmark:** **150+ / 200 Net Marks** (75% net qualifying benchmark prominently highlighted on scorecards).

---

## 3. Non-Negotiables
1. **Strict Staged Delivery:** Follow [06_PROGRESS_TRACKER.md](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/PRD/06_PROGRESS_TRACKER.md) sequentially (Stage 0 $\to$ Stage 1 $\to$ Stage 2 $\to$ Stage 3 $\to$ Stage 4). Never skip ahead.
2. **Vision LLM Multimodal Extraction:** Plain Tesseract OCR is strictly forbidden as the primary extraction mechanism. Use Vision LLMs (OpenAI GPT-4o / Claude 3.5 Sonnet / Gemini 1.5 Flash) with high-DPI page rendering to preserve math, options, and question layout.
3. **Cheating Prevention (Hidden Answer Keys):** Never deliver `correctOption` in client-side state during an active test session (`/test/[mockId]`). Reveal answer keys and explanations only upon post-submission scorecard retrieval (`/results/[attemptId]`).
4. **Exact Negative Marking:** Ensure negative penalty calculations are applied across total scores and section-wise breakdowns.
5. **Local-First & Candidate Ergonomics:** Zero cumbersome setups; runs seamlessly on `localhost:3000` for a single candidate preparing on desktop/laptop CBT browsers.
6. **In-Flight State Persistence:** Mid-test page refreshes must seamlessly restore candidate answers and remaining timer state from `localStorage`.

---

## 4. Source Data Locations
- **PRD Documentation:** [PRD/](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/PRD)
- **Source Exam PDFs (PYQs):** [data/pyq/](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/data/pyq) (`chsl/`, `mts/`, `nbe/`)
- **Official Syllabus References:** [data/syllabus/](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/data/syllabus)
- **Paper Pattern Specification:** [data/reference/paper_pattern.md](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/data/reference/paper_pattern.md)

---

## 5. Build Order & Milestones
- **Stage 0: Bootstrap** — Next.js 14, TypeScript strict, Tailwind CSS, color tokens, layout, and environment configuration.
- **Stage 1: Foundation + Seed Bank + Live CBT UI** — 200+ seed question bank, mock generator algorithm, 180-min CBT exam interface (palette, tabs, shortcuts, auto-submit), and negative-marking result analytics.
- **Stage 2: Vision LLM PDF Extraction Pipeline** — PDF-to-image conversion, Vision LLM structured JSON ingestion, section classification, deduplication, and Admin UI uploader.
- **Stage 3: Full Mock Engine & Candidate Readiness** — Generate 6–10 unique full-length mocks from the aggregated PYQ bank, paper review mode, and error hardening.
- **Stage 4: Polish & Production Hardening** — Production build checks, performance optimization, and candidate handoff documentation.

---

## 6. Coding Standards Pointer
Adhere strictly to [05_CODE_STANDARDS.md](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/PRD/05_CODE_STANDARDS.md):
- Next.js 14 App Router with React Server Components by default; `'use client'` only where interactive state is required.
- TypeScript in `strict` mode with zero `any` types (use `unknown` + narrow).
- Shared domain types centralized in [src/types/index.ts](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/src/types/index.ts).
- Zod schema validation for all API inputs and mutation contracts.
- CBT monospace tabular numerals (`font-tabular`) for zero-jitter timer display.

---

## 7. Architecture Pointer
Follow [02_ARCHITECTURE.md](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/PRD/02_ARCHITECTURE.md):
- **API Endpoints:** `/api/upload`, `/api/extract`, `/api/generate-mock`, `/api/mock/[mockId]`, `/api/submit`, `/api/results/[attemptId]`, `/api/bank-stats`.
- **State Management:** Zustand store (`testStore.ts`) for active exam lifecycle (IDLE $\to$ IN_PROGRESS $\to$ SUBMITTED).
- **Data Layer:** Local-first JSON repository / SQLite.
- **Security:** Vision LLM API keys server-side only; never leaked to client bundles.

---

## 8. UI Pointer
Follow [03_UI_CONTEXT.md](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/PRD/03_UI_CONTEXT.md):
- Authentic CBT design with fixed semantic palette:
  - **Answered:** Green (`#27AE60`)
  - **Not Answered / Skipped:** Red/Orange (`#E74C3C` / `#C0392B`)
  - **Marked for Review:** Purple (`#8E44AD`)
  - **Not Visited:** Neutral Grey (`#BDC3C7`)
  - **Current Question:** Exam Blue (`#2980B9`)
- 5-column question palette grid, section badges, 30-minute/10-minute/5-minute timer alert thresholds, and modal confirmations before submission.

---

## 9. AI Extraction Pointer
Follow [04_AI_WORKFLOW.md](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/PRD/04_AI_WORKFLOW.md) and [08_SOURCE_PRIORITY.md](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/PRD/08_SOURCE_PRIORITY.md):
- **Provider Priority:** OpenAI `gpt-4o` $\to$ Anthropic `claude-3-5-sonnet` $\to$ Google `gemini-1.5-flash`.
- **DPI Rendering:** 150–200 DPI PNG per page.
- **Section Classification & Filtering:** Heuristic fallback classifiers; soft-filter advanced geometry/trigonometry from Quant pool.
- **Deduplication:** SHA-256 normalized hash deduplication.
- **Logging:** Save raw extraction outputs to `data/logs/` for inspection and debugging.

---

## 10. Agent Behavior Rules
1. **Restate Goals:** Before writing code for any stage, restate the stage goal, task breakdown, and exit criteria.
2. **Execute Clean Vertical Slices:** Implement functional, end-to-end features rather than disconnected partial stubs.
3. **Verify Exit Criteria:** After every stage, provide an explicit checklist verifying every pass/fail criterion.
4. **Scope Control:** Do not introduce unrequested external dependencies or features outside the PRD without prior confirmation.
5. **No False Claims of Completion:** Never claim a task or stage is complete unless tests, builds, and user flows have been verified against active running code.
