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
| **1.5**| Cloud DB & Auth & Rules | MongoDB Atlas (Mongoose), NextAuth login, Student Dashboard, Pre-Exam Rules | `[x] Done` |
| **2** | Vision LLM Pipeline | PDFs extracted into MongoDB Atlas section pools | `[x] Done` |
| **3** | Multi-Candidate Engine | 6+ full mocks generated, personal progress tracking, review mode | `[x] Done` |
| **4** | Vercel Deployment & Polish | Vercel production build, performance, candidate handoff | `[x] Done` |
| **5** | Public Landing Page | High-converting marketing landing at `/` with auto-redirect for logged-in users | `[x] Complete & Verified` |
| **6** | Advanced Dashboard Analytics | Comprehensive 11-module analytics overhaul with Recharts & empty states | `[x] Complete & Verified` |
| **7** | UI/Design System Upgrade | Cohesive Tailwind tokens, typography scale, elevated cards, skeleton loaders | `[ ] Pending` |
| **8** | Login & Activity Tracking | `LoginSession` model, 60s client heartbeat, admin activity audit feed | `[ ] Pending` |

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
**Status:** `[x] Complete & Verified`

### Tasks
- [x] Vercel deployment test (`npm run build` passing with 0 errors)
- [x] Multi-device responsiveness (Desktop & mobile responsive layouts, sticky palette, tabular figures)
- [x] High-speed database query projections (`getQuestionsByIds`)
- [x] Fullscreen CBT exam mode & live auto-save indicators
- [x] Candidate handoff guide (`CANDIDATE_GUIDE.md`)

---

## STAGE 5 — Public Landing Page (Marketing Home)
**Status:** `[x] Complete & Verified`

> **Goal:** Transform the unauthenticated root `/` into a high-converting, SaaS B2B marketing landing page for founder demos and coaching institute prospect presentations, while auto-redirecting authenticated candidates to `/dashboard`.

### Tasks
- [x] Move existing candidate lobby from `src/app/page.tsx` to `src/app/dashboard/page.tsx`
- [x] Rebuild `src/app/page.tsx` as an unauthenticated server component:
  - [x] Session check: auto-redirect authenticated candidates to `/dashboard`
  - [x] Sticky top navigation with brand logo, section anchors, and "Sign In" button
  - [x] Hero Section: Headline, sub-headline, primary CTA ("Request Demo"), secondary CTA ("Watch Preview"), product mockup
  - [x] Trust Strip: Target exams (NBE, SSC CHSL/CGL/MTS, DSSSB, State exams)
  - [x] Feature Grid: 6 SaaS cards (CBT simulator, Vision ingestion, diagrams/tables, negative marking, AI mentor, white-label)
  - [x] How It Works: 3-step visual workflow
  - [x] Analytics Preview: Snapshot of dashboard and AI audit
  - [x] Who It's For: Coaching institutes, startups, YouTube educators
  - [x] Pricing Tiers: Pilot, SaaS Starter, SaaS Pro, Custom Enterprise
  - [x] Contact Section & Modal: Inbound lead capture form ("Book Demo Call")
  - [x] Footer: Brand, contact email, "Built in India", social links, copyright
- [x] Add SEO `<meta>` tags, OpenGraph social card (`public/og-image.png`), favicon, and page title

### Files Touched
- `src/app/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/components/landing/LandingView.tsx`
- `src/components/landing/LandingNavbar.tsx`
- `src/components/landing/HeroSection.tsx`
- `src/components/landing/TrustStrip.tsx`
- `src/components/landing/FeatureGrid.tsx`
- `src/components/landing/HowItWorks.tsx`
- `src/components/landing/AnalyticsPreview.tsx`
- `src/components/landing/TargetAudience.tsx`
- `src/components/landing/PricingTiers.tsx`
- `src/components/landing/ContactModal.tsx`
- `src/components/landing/LandingFooter.tsx`
- `src/app/api/contact/route.ts`
- `public/og-image.png`

### Exit Criteria
- [x] Visiting `/` in logged-out state shows full landing
- [x] Visiting `/` in logged-in state redirects to `/dashboard`
- [x] Contact form or CTA works (submits to `/api/contact` with WhatsApp fallback)
- [x] Mobile + desktop render cleanly
- [x] Next.js production build succeeds with 0 errors (`npm run build`)

### Demo Script
1. In an unauthenticated/incognito tab, navigate to `http://localhost:3000/`. Verify all 10 landing sections render cleanly without auth prompts.
2. Click "Sign In" button in top nav. Verify smooth navigation to `/login`.
3. Sign in as candidate user. Verify automatic redirect to `/dashboard`.
4. In the same tab, navigate back to `http://localhost:3000/`. Verify immediate redirect to `/dashboard` with zero flash.
5. Click "Request Demo" and submit test contact details. Verify submission feedback.

---

## STAGE 6 — Advanced Dashboard Analytics (Analytics Overhaul)
**Status:** `[x] Complete & Verified`

> **Goal:** Overhaul the candidate `/dashboard` into an executive-grade analytical command center with 11 specialized modules (A through K) powered by Recharts and MongoDB Atlas attempt data.

### Tasks
- [x] Create `src/lib/analytics-helpers.ts` for server-side metric aggregations
- [x] Implement Module A: Enhanced KPI Row (`EnhancedKpiRow.tsx` — Tests, avg score, highest, accuracy, practice hours, target gap)
- [x] Implement Module B: Score Trajectory (`ScoreTrajectoryChart.tsx` — LineChart, 150 ref line, Last 5/10/All toggle)
- [x] Implement Module C: Sectional Mastery (`SectionalMasteryCharts.tsx` — RadarChart + horizontal BarChart, best green, weakest red)
- [x] Implement Module D: Strength & Weakness Panel (`StrengthWeaknessPanel.tsx` — Top 2, bottom 2, wrong rate, unattempted rate)
- [x] Implement Module E: Time Analytics (`TimeAnalyticsChart.tsx` — Time per section, time per question, overrun alert)
- [x] Implement Module F: Negative Marking Leakage Card (`NegativeMarkingLeakageCard.tsx` — Total penalty marks lost, stacked bar)
- [x] Implement Module G: Topic Heatmap (`TopicHeatmap.tsx` — Topic accuracy grid; gracefully hides if tags absent)
- [x] Implement Module H: Improvement Trend (`ImprovementTrendBadge.tsx` — Rolling 3-attempt comparison badge)
- [x] Implement Module I: Countdown / Goal Widget (`CountdownGoalWidget.tsx` — Exam countdown + customizable target date/score)
- [x] Integrate Module J: Multi-Mock Strategic Audit Card
- [x] Implement Module K: Recent Attempts Table (`RecentAttemptsTable.tsx` — Zebra rows, Net score, accuracy, time taken, scorecard CTA)
- [x] Build Empty State (`DashboardEmptyState.tsx` — Welcoming onboarding state for users with 0 attempts)
- [x] Build Skeleton Loading Shimmer (`DashboardSkeleton.tsx`)

### Files Touched
- `src/app/dashboard/page.tsx`
- `src/components/dashboard/EnhancedKpiRow.tsx`
- `src/components/dashboard/ScoreTrajectoryChart.tsx`
- `src/components/dashboard/SectionalMasteryCharts.tsx`
- `src/components/dashboard/StrengthWeaknessPanel.tsx`
- `src/components/dashboard/TimeAnalyticsChart.tsx`
- `src/components/dashboard/NegativeMarkingLeakageCard.tsx`
- `src/components/dashboard/TopicHeatmap.tsx`
- `src/components/dashboard/ImprovementTrendBadge.tsx`
- `src/components/dashboard/CountdownGoalWidget.tsx`
- `src/components/dashboard/RecentAttemptsTable.tsx`
- `src/components/dashboard/DashboardEmptyState.tsx`
- `src/lib/analytics-helpers.ts`
- `src/types/analytics.ts`

### Exit Criteria
- [x] All new widgets render with real user data
- [x] Charts responsive and readable
- [x] Empty state works for a user with 0 attempts
- [x] No regression in existing KPI/trajectory/section widgets

### Demo Script
1. Log in as a candidate with past test attempts. Verify all 11 modules render with accurate calculations from MongoDB Atlas.
2. Interact with the Score Trajectory toggle (`Last 5` / `Last 10` / `All`) and verify chart points change responsively.
3. Hover over Sectional Mastery charts and verify the highest scoring section is badged green and lowest is badged red.
4. Verify Negative Marking Leakage card accurately computes `wrongCount * 0.25` marks lost across attempts.
5. Create or log in as a fresh user with 0 attempts. Verify `DashboardEmptyState` renders with "Take your first mock" CTA.

---

## STAGE 7 — UI / Design System Upgrade (SaaS-Grade Polish)
**Status:** `[ ] Pending`

> **Goal:** Elevate visual aesthetics to B2B SaaS founder-demo standards with unified Tailwind tokens, typography scale, elevated cards, skeleton loaders, and responsive polish without breaking existing CBT exam UX.

### Tasks
- [ ] Update `tailwind.config.ts` with complete design token palette (`brand-primary`, `brand-accent`, `surface`, `surface-alt`, `border`, `muted`, `success`, `warning`, `danger`, and colorblind-safe chart palette)
- [ ] Standardize typography scale in `src/app/globals.css`
- [ ] Refactor UI primitives in `src/components/ui/` (`Card.tsx`, `Button.tsx`, `Badge.tsx`, `Skeleton.tsx`)
- [ ] Upgrade Header/Navbar with candidate avatar initials dropdown (Profile info, Sign out)
- [ ] Standardize card style: rounded-2xl, subtle borders, soft shadows, uppercase eyebrow labels
- [ ] Upgrade tables: zebra rows, hover states, sticky header
- [ ] Add toast notification system for user milestones
- [ ] Accessibility spot-check: focus rings, aria-labels on charts and palettes
- [ ] Verify responsive layout across 1280px, 1440px, 1920px, and mobile (< 1024px)

### Files Touched
- `tailwind.config.ts`
- `src/app/globals.css`
- `src/components/ui/Card.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/ui/Skeleton.tsx`
- `src/components/Navbar.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/results/[attemptId]/page.tsx`
- `src/app/test/[mockId]/page.tsx`

### Exit Criteria
- [ ] Landing, Dashboard, Test UI, Results, Admin all use unified design tokens
- [ ] No visual regressions in test-taking flow
- [ ] Accessibility spot-check passes (focus states, labels)

### Demo Script
1. Navigate across all core screens (Landing, Dashboard, Test Instructions, CBT Hall, Results, Admin). Verify unified fonts, colors, and border radii.
2. Verify interactive button states (hover, focus rings, active press).
3. Start a mock test and verify the live CBT exam interface preserves its distraction-free dark layout, palette, and tabular timer numerals without regression.
4. Test responsiveness by resizing the browser across 1280px, 1440px, 1920px, and mobile viewport (< 1024px).

---

## STAGE 8 — User Login & Activity Tracking + Admin Visibility
**Status:** `[ ] Pending`

> **Goal:** Track exact usage across the 5 controlled users (sisters, friend, founder, test user, demo bot) with a `LoginSession` model, 60-second client heartbeat, and an administrative activity dashboard at `/admin/activity`.

### Tasks
- [ ] Create Mongoose `LoginSession` model in `src/models/LoginSession.ts`
- [ ] Wire NextAuth signIn event to create `LoginSession` (recording userId, username, ipAddress, userAgent, device, approxLocation)
- [ ] Implement client heartbeat component `src/components/SessionHeartbeat.tsx` (60s interval to `/api/session/ping`)
- [ ] Build API endpoints:
  - [ ] `POST /api/session/ping`: Debounced heartbeat update to `lastActivityAt` and `pagesVisited`
  - [ ] `POST /api/session/logout`: Explicit logout closer calculating `sessionDurationSeconds`
  - [ ] `GET /api/admin/activity`: Admin-only session statistics and timeline
- [ ] Build Admin Activity Page `src/app/admin/activity/page.tsx`:
  - [ ] Overall stats: Logins today, this week, this month, active users now
  - [ ] Per-user summary table: Username, sessions, time spent, last login, device, IP, location
  - [ ] Chronological session timeline: Latest 50 sessions
  - [ ] User and date range filters
  - [ ] Export CSV button
- [ ] Add "Active Users Right Now" card on `/admin/page.tsx` with quick link to `/admin/activity`
- [ ] Enforce RBAC security: Non-admin users attempting to access `/admin/activity` receive HTTP 403 Forbidden

### Files Touched
- `src/models/LoginSession.ts`
- `src/lib/session-tracker.ts`
- `src/lib/auth.ts`
- `src/components/SessionHeartbeat.tsx`
- `src/app/api/session/ping/route.ts`
- `src/app/api/session/logout/route.ts`
- `src/app/api/admin/activity/route.ts`
- `src/app/admin/activity/page.tsx`
- `src/app/admin/page.tsx`
- `src/components/admin/activity/ActiveUsersCard.tsx`
- `src/components/admin/activity/UserSessionTable.tsx`
- `src/components/admin/activity/SessionTimeline.tsx`

### Exit Criteria
- [ ] Every login creates a LoginSession
- [ ] Explicit logout closes the session correctly
- [ ] Inactivity closes session within 30 minutes
- [ ] Admin can see all 5 users' sessions, durations, devices, IPs, approx location
- [ ] Non-admin users are blocked from `/admin/activity`
- [ ] "Active Now" count updates in near real-time

### Demo Script
1. Log in as candidate user in Chrome. Verify `LoginSession` document is created in MongoDB Atlas.
2. Open Network tab. Confirm `POST /api/session/ping` fires every 60 seconds with current page.
3. Click "Sign Out". Verify `POST /api/session/logout` closes the session with total duration.
4. Log in as `admin`. Open `/admin`. Verify "Active Users Right Now" card displays accurate count.
5. Navigate to `/admin/activity`. Verify per-user table and session timeline reflect all historical logins.
6. Attempt to navigate to `/admin/activity` as a non-admin student. Verify access is blocked with 403.