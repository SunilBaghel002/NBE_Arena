# PROGRESS TRACKER.md
## NBE Arena — Staged Delivery Plan

> **Philosophy:** Ship a usable mock test flow ASAP. Extraction can be improved iteratively.
> Each stage must leave the app in a runnable state.

---

## Stage Overview

| Stage | Name | Goal | Status |
|-------|------|------|--------|
| **0** | Bootstrap | Next.js 14 TS app, styling, types, configuration | `[x] Done` |
| **1** | Foundation + CBT UI | Seed question bank (200Q), mock generator, CBT UI, scoring | `[x] Done` |
| **1.5**| Cloud DB & Auth & Rules | MongoDB Atlas (Mongoose), NextAuth login, Student Dashboard, Pre-Exam Rules | `[ ] In Progress` |
| **2** | Vision LLM Pipeline | PDFs extracted into MongoDB Atlas section pools | `[ ] Pending` |
| **3** | Multi-Candidate Engine | 6+ full mocks generated, personal progress tracking, review mode | `[ ] Pending` |
| **4** | Vercel Deployment & Polish | Vercel production build, performance, candidate handoff | `[ ] Pending` |

---

## STAGE 0 — Bootstrap
**Status:** `[x] Done`

### Tasks
- [x] Create Next.js 14 TS app (`nbe-arena`)
- [x] Install Tailwind, shadcn/ui, zod, zustand, lucide-react
- [x] Setup folder structure per Architecture.md
- [x] Add `.env.local.example`
- [x] Add README with run instructions
- [x] Verify `npm run dev` works

### Exit Criteria
- [x] Blank app loads at localhost:3000

---

## STAGE 1 — Foundation + Manual Question Bank + Test UI
**Status:** `[x] Done`

### Tasks
- [x] Define TypeScript types (`Question`, `MockTest`, `Attempt`)
- [x] Create `data/seed-questions.json` with 200 MCQs (50 Reasoning, 50 GA, 50 Quant, 50 English)
- [x] Build DB abstraction layer
- [x] API: `GET /api/bank-stats`
- [x] API: `POST /api/generate-mock`
- [x] API: `GET /api/mock/[mockId]` (hide correctOption)
- [x] API: `POST /api/submit`
- [x] API: `GET /api/results/[attemptId]`
- [x] Zustand `testStore`
- [x] UI: Lobby page
- [x] UI: Live Test page (timer, palette, sections, navigation)
- [x] UI: Submit confirmation modal
- [x] UI: Results page (score, section breakdown, wrong answers)
- [x] localStorage persistence for in-progress attempt
- [x] Auto-submit on timer = 0

### Exit Criteria
- [x] Can generate a 200-question mock from seed bank
- [x] Can attempt full test with 180-min timer
- [x] Can submit and see score out of 200
- [x] Section scores show correctly
- [x] Refresh mid-test does not wipe answers
- [x] Scoring uses -0.25 correctly

---

## STAGE 1.5 — Cloud Database, NextAuth, Student Dashboards & Pre-Exam Rules
**Status:** `[x] Done`

> **Goal:** Migrate from local JSON to MongoDB Atlas, add NextAuth credentials authentication for candidate friends, build personalized student dashboards, and enforce pre-exam instructions review before CBT countdown begins.

### Tasks
- [x] Install `mongoose`, `next-auth`, `bcryptjs`, `@types/bcryptjs`
- [x] Setup MongoDB Atlas singleton connection in `src/lib/mongodb.ts`
- [x] Create Mongoose models in `src/models/`:
  - `User.ts` (username, passwordHash, name, role)
  - `Question.ts` (section, questionText, options, correctOption, explanation, isActive)
  - `MockTest.ts` (title, sections, totalQuestions, timeLimitMinutes)
  - `Attempt.ts` (userId, mockId, answers, score, timeTakenSeconds)
- [x] Seed default users (`admin` and `student` accounts) and import 200 seed questions into MongoDB Atlas
- [x] Configure NextAuth.js Credentials Provider with JWT session in `src/lib/auth.ts`
- [x] Create Login Screen (`/login`)
- [x] Create Pre-Exam Rules & Instructions Page (`/test/[mockId]/instructions`):
  - 200 Qs, 180 Mins, 4 Sections × 50, +1 / -0.25 scheme
  - Mandatory disclaimer checkbox: *"I have read and understood the instructions"*
  - "Begin Test" button enabled only after checkbox checked
- [x] Update Live Test Page (`/test/[mockId]`): 180-min timer commences only when "Begin Test" is clicked
- [x] Create Student Dashboard (`/`):
  - User greeting & role badge
  - Personal test attempts history & progress
  - Average score, accuracy %, and qualifying target status
  - Available mock cards with "Start Mock" (routes to instructions)
- [x] Protect `/admin` route with role check (`role === "admin"`)
- [x] Update API routes to authenticate with `getServerSession` and filter attempts by `userId`

### Exit Criteria
- [x] User can log in with Credentials
- [x] Data persists to MongoDB Atlas
- [x] Clicking "Start Mock" routes to `/test/[mockId]/instructions`
- [x] Timer does not start until candidate checks disclaimer and clicks "Begin Test"
- [x] Student dashboard displays candidate-specific attempts and scores
- [x] Non-admin cannot access `/admin`

---

## STAGE 2 — Hybrid AI PDF Extraction Pipeline (MongoDB Integrated)
**Status:** `[x] Complete & Verified`

> **Goal:** Deploy the zero-cost / high-sustainability Hybrid Extraction Engine (Groq for text pages, OpenRouter Qwen2.5-VL / Gemini Flash for vision pages) to bulk-ingest questions from PYQ PDFs into MongoDB Atlas.

### Tasks
- [x] Implement `src/lib/pdf-pipeline.ts` orchestrating Path A (text) and Path B (vision)
- [x] Implement `src/lib/text-extract.ts` (Groq / OpenRouter text parser)
- [x] Implement `src/lib/vision-extract.ts` (OpenRouter Qwen2.5-VL, Gemini Flash, Ollama adapters)
- [x] Implement `src/lib/pdf-text.ts` (Per-page PDF layer text extractor)
- [x] Implement `src/lib/prompts.ts` with temperature: 0 extraction prompts
- [x] Implement JSON schema validation + automatic 1-retry repair
- [x] Implement `src/lib/section-classifier.ts` keyword fallback
- [x] Implement `src/lib/dedupe.ts` (SHA-256 content hash against MongoDB Atlas)
- [x] API: `POST /api/upload` (multipart PDF handler) & `POST /api/extract` (per-page stream progress)
- [x] API: `GET /api/pyq-list` (enumerate available PYQs and provider configs)
- [x] Admin UI: Ingestion tab with PYQ selector, page range, and live telemetry log (Admin role only)
- [x] Add telemetry logging to `data/logs/extraction_telemetry.json`

### Exit Criteria
- [x] Hybrid extraction works (routes text-layer pages to text LLM, image pages to Vision VLM)
- [x] Provider and models can be switched via environment variables only (zero hardcoding)
- [x] Successfully extracted at least 1 SSC CHSL PDF using non-OpenAI primary provider (OpenRouter Qwen2.5-VL / Groq)
- [x] Invalid JSON retry works reliably
- [x] Rate limits and provider errors degrade gracefully to fallback providers
- [x] Questions appear under correct sections in MongoDB Atlas (>= 70% precision)
- [x] Duplicate questions are skipped via SHA-256 hash checks

---

## STAGE 3 — Multi-Candidate Mock Engine Quality & Hardening
**Status:** `[x] Complete & Verified`

### Tasks
- [x] Enforce 50-per-section gate in MongoDB (Reasoning, GA, Quant, English >= 50)
- [x] Generate 6–10 unique mocks (6 full mocks generated with 200 questions each in MongoDB Atlas)
- [x] Personal candidate progress tracking charts (Net score trajectory, 150 benchmark line, and sectional mastery cards)
- [x] Paper review mode (Section & status filters, question palette jump grid, official answer keys, and step-by-step explanations)
- [x] Test on multi-user scenarios (Isolated student lobbies for candidates Karishma & Prachii, Admin candidate progress monitoring and credentials editor)

---

## STAGE 4 — Polish & Vercel Production Hardening
**Status:** `[ ] Pending`

### Tasks
- [ ] Vercel deployment test (`npm run build`)
- [ ] Multi-device responsiveness
- [ ] Candidate handoff guide