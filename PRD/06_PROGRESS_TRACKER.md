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
**Status:** `[ ] In Progress`

> **Goal:** Migrate from local JSON to MongoDB Atlas, add NextAuth credentials authentication for candidate friends, build personalized student dashboards, and enforce pre-exam instructions review before CBT countdown begins.

### Tasks
- [ ] Install `mongoose`, `next-auth`, `bcryptjs`, `@types/bcryptjs`
- [ ] Setup MongoDB Atlas singleton connection in `src/lib/mongodb.ts`
- [ ] Create Mongoose models in `src/models/`:
  - `User.ts` (username, passwordHash, name, role)
  - `Question.ts` (section, questionText, options, correctOption, explanation, isActive)
  - `MockTest.ts` (title, sections, totalQuestions, timeLimitMinutes)
  - `Attempt.ts` (userId, mockId, answers, score, timeTakenSeconds)
- [ ] Seed default users (`admin` and `student` accounts) and import 200 seed questions into MongoDB Atlas
- [ ] Configure NextAuth.js Credentials Provider with JWT session in `src/lib/auth.ts`
- [ ] Create Login Screen (`/login`)
- [ ] Create Pre-Exam Rules & Instructions Page (`/test/[mockId]/instructions`):
  - 200 Qs, 180 Mins, 4 Sections × 50, +1 / -0.25 scheme
  - Mandatory disclaimer checkbox: *"I have read and understood the instructions"*
  - "Begin Test" button enabled only after checkbox checked
- [ ] Update Live Test Page (`/test/[mockId]`): 180-min timer commences only when "Begin Test" is clicked
- [ ] Create Student Dashboard (`/`):
  - User greeting & role badge
  - Personal test attempts history & progress
  - Average score, accuracy %, and qualifying target status
  - Available mock cards with "Start Mock" (routes to instructions)
- [ ] Protect `/admin` route with role check (`role === "admin"`)
- [ ] Update API routes to authenticate with `getServerSession` and filter attempts by `userId`

### Exit Criteria
- [ ] User can log in with Credentials
- [ ] Data persists to MongoDB Atlas
- [ ] Clicking "Start Mock" routes to `/test/[mockId]/instructions`
- [ ] Timer does not start until candidate checks disclaimer and clicks "Begin Test"
- [ ] Student dashboard displays candidate-specific attempts and scores
- [ ] Non-admin cannot access `/admin`

---

## STAGE 2 — Vision LLM PDF Extraction Pipeline (MongoDB Integrated)
**Status:** `[ ] Pending`

### Tasks
- [ ] Implement `pdf-to-images` utility
- [ ] Implement `vision-extract.ts` with provider switch (OpenAI / Claude / Gemini)
- [ ] Extraction prompts in `src/lib/prompts.ts`
- [ ] JSON schema validation and section classifier fallback
- [ ] SHA-256 deduplication against MongoDB Question collection
- [ ] API: `POST /api/upload` & `POST /api/extract`
- [ ] Admin UI: drag-drop uploader with live extraction progress (Admin role only)

### Exit Criteria
- [ ] Upload 1 real SSC CHSL PDF
- [ ] Extract ≥ 40 usable questions directly into MongoDB Atlas
- [ ] Correct section tagging and deduplication

---

## STAGE 3 — Multi-Candidate Mock Engine Quality & Hardening
**Status:** `[ ] Pending`

### Tasks
- [ ] Enforce 50-per-section gate in MongoDB
- [ ] Generate 6–10 unique mocks
- [ ] Personal candidate progress tracking charts
- [ ] Paper review mode
- [ ] Test on multi-user scenarios

---

## STAGE 4 — Polish & Vercel Production Hardening
**Status:** `[ ] Pending`

### Tasks
- [ ] Vercel deployment test (`npm run build`)
- [ ] Multi-device responsiveness
- [ ] Candidate handoff guide