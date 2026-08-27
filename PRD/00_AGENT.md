# 00_AGENT.md — NBE Arena Base Instruction & Permanent Brain

> **Role & Purpose:**  
> You are the primary project architect and implementation agent for `nbe_arena`. This document acts as your permanent brain and foundational operational directive for all coding, architectural, and evaluation activities in this repository.

---

## 1. Mission
Build a cloud-enabled, Vercel-deployable web platform (powered by **MongoDB Atlas** and **NextAuth.js**) that automatically converts SSC CHSL, SSC MTS, DSSSB (LDC / Junior Assistant), and official NBE 2015 PYQ PDFs into unlimited authentic **NBE Junior Assistant Mock Tests** with personal candidate tracking, pre-exam CBT instruction screens, 180-minute countdown timers, question palettes, and rigorous negative marking analytics.

---

## 2. Exam Truth Source
All platform mock tests and evaluation engines must adhere strictly to the official NBEMS Junior Assistant Examination specifications:

- **Total Questions:** 200 Questions (MCQs)
- **Total Duration:** 180 Minutes (3.0 Hours Continuous Countdown after Instructions Confirmation)
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
- **Target Practice Benchmark:** **150+ / 200 Net Marks** (75% net qualifying benchmark prominently highlighted on scorecards and student dashboards).

---

## 3. Non-Negotiables
1. **Cloud Database (MongoDB Atlas + Mongoose):** Persistent storage using MongoDB Atlas via Mongoose ODM (`MONGODB_URI` / `MONGO_URL`). No local-only filesystem dependencies for production candidate data.
2. **Authentication & Multi-Candidate Dashboards:** NextAuth.js (Auth.js) Credentials Provider with role-based access (`admin` vs `student`). Each candidate has an isolated personal dashboard tracking test history, score progression, and accuracy. Test attempts store `userId`.
3. **Admin Route Protection:** Only authenticated users with `role: "admin"` can access `/admin` for PDF uploads and question repository management.
4. **Mandatory Pre-Exam Instructions Flow:** Clicking "Start Mock" must route the candidate to `/test/[mockId]/instructions`. The 180-minute countdown timer must NEVER begin until the candidate reads the rules, checks *"I have read and understood the instructions"*, and clicks **"Begin Test"**.
5. **Vision LLM Multimodal Extraction:** Plain Tesseract OCR is strictly forbidden as the primary extraction mechanism. Use Vision LLMs (OpenAI GPT-4o / Claude 3.5 Sonnet / Gemini 1.5 Flash) with high-DPI page rendering.
6. **Cheating Prevention (Hidden Answer Keys):** Never deliver `correctOption` in client-side state during an active test session (`/test/[mockId]`). Reveal answer keys only upon post-submission scorecard retrieval (`/results/[attemptId]`).
7. **Exact Negative Marking:** Ensure negative penalty calculations (`-0.25`) are applied across total scores and section-wise breakdowns.
8. **In-Flight State Persistence:** Mid-test page refreshes must seamlessly restore candidate answers and remaining timer state from `localStorage`.

---

## 4. Source Data Locations
- **PRD Documentation:** [PRD/](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/PRD)
- **Source Exam PDFs (PYQs):** [data/pyq/](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/data/pyq) (`chsl/`, `mts/`, `nbe/`)
- **Official Syllabus References:** [data/syllabus/](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/data/syllabus)
- **Paper Pattern Specification:** [data/reference/paper_pattern.md](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/data/reference/paper_pattern.md)

---

## 5. Build Order & Milestones
- **Stage 0: Bootstrap** — Next.js 14, TypeScript strict, Tailwind CSS, color tokens, layout, and environment configuration.
- **Stage 1: Foundation + Seed Bank + Live CBT UI + MongoDB Atlas + NextAuth** — MongoDB Atlas integration with Mongoose, NextAuth Credentials authentication, pre-exam rules screen, 200+ seed question bank, mock generator, 180-min CBT exam interface, personal student dashboard, and negative-marking result analytics.
- **Stage 2: Vision LLM PDF Extraction Pipeline** — PDF-to-image conversion, Vision LLM structured JSON ingestion, section classification, deduplication, and Admin UI uploader (restricted to `admin` role).
- **Stage 3: Full Mock Engine & Candidate Readiness** — Generate 6–10 unique full-length mocks from the aggregated PYQ bank, paper review mode, and error hardening.
- **Stage 4: Polish & Production Hardening** — Vercel deployment verification, performance optimization, and candidate handoff.

---

## 6. Coding Standards Pointer
Adhere strictly to [05_CODE_STANDARDS.md](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/PRD/05_CODE_STANDARDS.md):
- Next.js 14 App Router with React Server Components by default; `'use client'` only where interactive state is required.
- Mongoose singleton connection pattern in `src/lib/mongodb.ts`.
- Mongoose schema models: `User`, `Question`, `MockTest`, `Attempt`.
- TypeScript in `strict` mode with zero `any` types.
- Zod schema validation for all API inputs and mutations.
- CBT monospace tabular numerals (`font-tabular`) for zero-jitter timer display.

---

## 7. Architecture Pointer
Follow [02_ARCHITECTURE.md](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/PRD/02_ARCHITECTURE.md):
- **Database:** MongoDB Atlas via Mongoose ODM.
- **Auth:** NextAuth.js Credentials Provider with JWT sessions.
- **API Endpoints:** `/api/auth/[...nextauth]`, `/api/upload`, `/api/extract`, `/api/generate-mock`, `/api/mock/[mockId]`, `/api/submit`, `/api/results/[attemptId]`, `/api/bank-stats`, `/api/attempts/user`.
- **Security:** Passwords hashed with `bcryptjs`, Vision LLM API keys server-side only, RBAC middleware protecting `/admin`.

---

## 8. UI Pointer
Follow [03_UI_CONTEXT.md](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/PRD/03_UI_CONTEXT.md):
- **Screens:**
  1. Login Page (`/login`)
  2. Student Dashboard (`/` or `/dashboard`) with personalized attempt history, average score, performance chart, and available mocks.
  3. Pre-Exam Rules / Instructions Screen (`/test/[mockId]/instructions`) with disclaimer checkbox.
  4. CBT Live Test Hall (`/test/[mockId]`) with 5-column palette, tabs, and timer.
  5. Scorecard & Review (`/results/[attemptId]`).
  6. Admin Panel (`/admin` — Admin role only).

---

## 9. AI Extraction Pointer
Follow [04_AI_WORKFLOW.md](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/PRD/04_AI_WORKFLOW.md) and [08_SOURCE_PRIORITY.md](file:///c:/Users/lenovo/OneDrive/Desktop/Extra/NBE_Arena/PRD/08_SOURCE_PRIORITY.md):
- **Provider Priority:** OpenAI `gpt-4o` $\to$ Anthropic `claude-3-5-sonnet` $\to$ Google `gemini-1.5-flash`.
- **DPI Rendering:** 150–200 DPI PNG per page.
- **Deduplication:** SHA-256 normalized hash deduplication.

---

## 10. Agent Behavior Rules
1. **Restate Goals:** Before writing code for any stage, restate the stage goal, task breakdown, and exit criteria.
2. **Execute Clean Vertical Slices:** Implement functional, end-to-end features rather than disconnected partial stubs.
3. **Verify Exit Criteria:** After every stage, provide an explicit checklist verifying every pass/fail criterion.
4. **Scope Control:** Align with MongoDB Atlas, NextAuth, and Pre-Exam Instructions specifications.
5. **No False Claims of Completion:** Never claim a task or stage is complete unless tests, builds, and user flows have been verified against active running code.
