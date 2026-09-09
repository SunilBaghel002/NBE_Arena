# UI CONTEXT.md
## NBE Arena — UI/UX Specification

---

## 1. Design Principles

1. **Exam-first:** UI must feel like an authentic CBT (Computer Based Test) examination hall portal.
2. **Pre-Exam Clarity:** Candidate must review and explicitly acknowledge exam rules before the timer commences.
3. **Personalized Progress:** Each candidate has an isolated dashboard tracking their historical attempts, score progression, and accuracy.
4. **Zero distraction:** Clean CBT layout without extraneous animations or marketing distractions during active tests.
5. **Desktop primary:** Optimized for laptop and desktop screens (1366×768 and 1920×1080).
6. **Fixed Semantic CBT Palette:**
   - **Green (`#27AE60`):** Answered
   - **Red / Orange (`#E74C3C`):** Not Answered
   - **Purple (`#8E44AD`):** Marked for Review
   - **Purple with Dot (`#6C3483`):** Answered & Marked for Review
   - **Grey (`#BDC3C7` / `#E2E8F0`):** Not Visited
   - **Blue (`#2980B9`):** Current Active Question

---

## 2. Color Palette & Typography (SaaS Token System)

### 2.1 Design Tokens

| Token | Light Mode Hex | Dark Mode Hex | Usage |
|-------|----------------|---------------|-------|
| `brand-primary` | `#1A5276` | `#38BDF8` | CBT primary buttons, brand accents, active states |
| `brand-accent` | `#D97706` | `#FBBF24` | Warm highlights, target 150 benchmark lines |
| `surface` | `#FFFFFF` | `#0F172A` | Primary card and modal backgrounds |
| `surface-alt` | `#F8FAFC` | `#1E293B` | Table headers, secondary card wells, sidebar bg |
| `border` | `#E2E8F0` | `#334155` | Subtle container borders, dividing lines |
| `text` | `#0F172A` | `#F8FAFC` | High-contrast body and heading typography |
| `muted` | `#64748B` | `#94A3B8` | Subtitles, helper text, empty state labels |
| `success` | `#10B981` | `#34D399` | Answered questions, qualifying marks cleared, positive trends |
| `warning` | `#F59E0B` | `#FBBF24` | Timer alerts (<= 30m), moderate accuracy |
| `danger` | `#EF4444` | `#F87171` | Unanswered questions, negative marking penalty, timer flash |

### 2.2 Colorblind-Safe Chart Palette (Recharts)
All Recharts instances must consume this shared 6-color categorical palette:
- **Chart 1 (Reasoning / Primary):** `#2563EB` (Royal Blue)
- **Chart 2 (General Awareness):** `#059669` (Emerald Green)
- **Chart 3 (Quantitative Aptitude):** `#D97706` (Amber Ochre)
- **Chart 4 (English Comprehension):** `#7C3AED` (Deep Violet)
- **Chart 5 (Penalty / Leakage):** `#DC2626` (Crimson)
- **Chart 6 (Target Reference):** `#0D9488` (Teal)

### 2.3 Standardized Typography Scale
- **Display:** `text-4xl md:text-5xl font-extrabold tracking-tight` (Hero headline)
- **H1:** `text-2xl md:text-3xl font-bold tracking-tight` (Page titles, Scorecard hero)
- **H2:** `text-xl font-semibold tracking-tight` (Card module headers)
- **Body:** `text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed`
- **Small / Eyebrow:** `text-xs font-semibold uppercase tracking-wider text-slate-500`
- **Tabular Numerals:** `font-mono tracking-tight tabular-nums` (Timers, marks, delta scores)

---

## 3. Screen Specifications

### 3.1 Public Marketing Landing Page (`/`)
- **Route:** `/` (Unauthenticated public showcase).
- **Authentication Guard:** If candidate session exists, automatically server-redirect to `/dashboard` with zero layout shift.
- **Top Bar / Sticky Navigation:**
  - Left: NBE Arena Brand Logo + "White-Label CBT" badge.
  - Middle: Navigation links (`#features`, `#how-it-works`, `#analytics`, `#pricing`, `#contact`).
  - Right: "Sign In" button (navigates to `/login`) + "Request Demo" CTA button.
- **1. Hero Section:**
  - Eyebrow: `B2B WHITE-LABEL CBT ENGINE · POWERED BY VISION AI`
  - Headline: *"The White-Label CBT Engine Built for Real Exam Halls"*
  - Sub-headline: *"Empower your coaching institute with authentic 200-question computer-based mock exams, automated PYQ PDF ingestion, strict -0.25 negative marking analytics, and instant multi-mock AI diagnostics."*
  - CTAs: Primary *"Request Demo"* (opens Contact Modal) + Secondary *"Watch 60-sec Preview"* (placeholder video modal/trigger).
  - Visual: Polished isometric/perspective SaaS mockup of the CBT test hall and student analytics dashboard.
- **2. Trust Strip:**
  - *"Engineered specifically for candidates and coaching institutes targeting NBE, SSC CHSL/CGL/MTS, DSSSB LDC, and State examinations."*
  - Badges: 200 Questions · 180 Minutes · 4 Sections × 50 · Real CBT Interface.
- **3. Feature Grid (6 SaaS Cards):**
  - *Authentic CBT Test Simulator:* 5-column palette, sectional tabs, in-flight state persistence, auto-submit countdown.
  - *Vision VLM PDF Ingestion:* Ingest scanned and digital PYQ papers using Qwen2.5-VL and Groq without manual data entry.
  - *Rich Diagrams & Tables:* Automatic preservation of match-column tables and non-verbal reasoning diagrams.
  - *Negative Marking Diagnosis:* Precision tracking of marks lost to `-0.25` guessing penalties.
  - *AI Multi-Mock Performance Mentor:* Groq-powered multi-test comparative diagnostics and score improvement roadmap.
  - *B2B White-Label Ready:* Custom institute branding, candidate progress isolation, and administrative control.
- **4. How It Works (3-Step Pipeline):**
  - Step 1: Upload PYQ PDFs (Digital or Scanned papers).
  - Step 2: Auto-Generate 200-Q Mocks (Randomized section sampling with zero topic skew).
  - Step 3: Student Takes CBT & Gets AI Diagnosis (Instant scorecard + deep error diagnosis).
- **5. Analytics Preview Section:**
  - Interactive snapshot of the candidate analytics dashboard highlighting score trajectory, sectional radar, and negative penalty leakage card.
- **6. Target Audience ("Who It's For"):**
  - SSC & NBE Coaching Institutes (offline batches).
  - DSSSB & State Exam Academies.
  - Niche EdTech Startups & Test-Prep Portals.
  - YouTube Educators monetizing mock test series.
- **7. Pricing Tiers (B2B Showcase Cards):**
  - *Pilot:* Ideal for 1-month evaluation batch (up to 50 students, 10 mocks).
  - *SaaS Starter:* Small academies (up to 250 students, unlimited tests).
  - *SaaS Pro:* Growing institutes (custom domain, AI mentor reports, batch management).
  - *Custom Enterprise:* Multi-branch franchises with bespoke question banks and white-label mobile wrappers.
- **8. Contact Section & Lead Capture Modal:**
  - Form Fields: Candidate/Founder Name, Institute Name, Work Email, WhatsApp Number, Estimated Students, Message.
  - Quick action: "Book Demo Call".
- **9. Footer:**
  - Logo, contact email, "Built with pride in India", social links, copyright disclaimer.
- **SEO & Meta:**
  - Title: *"NBE Arena — White-Label CBT & AI Mentor Engine"*
  - Meta Description: *"High-performance white-label Computer Based Test (CBT) platform with Vision AI ingestion, authentic 200-question NBE/SSC mocks, and negative marking analytics."*
  - OG Image, Twitter Card tags, clean favicon.

---

### 3.2 Login Screen (`/login`)
- **Purpose:** Secure entry point for candidates and administrators.
- **Form:** Username, Password, Remember Me, Sign In button.
- **Validation:** Clear error toast on invalid credentials.
- **Redirect:** On success, routes to `/dashboard` (or `/admin` if admin user).

---

### 3.3 Advanced Student Dashboard (`/dashboard`)
- **Purpose:** Central intelligence hub for candidate practice, trajectory, and diagnostic analysis.
- **Header:** Candidate display name, Role badge (`Admin` or `Student`), target exam countdown, avatar dropdown (Profile, Sign out).

#### Dashboard Modules (A through K):
- **A. Enhanced KPI Row:**
  1. *Tests Completed:* Total submitted attempts count.
  2. *Average Net Score:* Historical mean net marks (out of 200).
  3. *Highest Net Score:* Peak score achieved.
  4. *Average Accuracy:* Overall percentage of attempted questions answered correctly.
  5. *Total Practice Time:* Aggregated hours/minutes spent in active CBT sessions.
  6. *Target Gap Indicator:* Real-time delta from the 150/200 qualifying mark (e.g. `"-29.5 marks to 150 benchmark"`).
- **B. Score Trajectory Chart:**
  - Recharts `LineChart` plotting chronological attempt scores against the horizontal **150 Qualifying Target Reference Line**.
  - Interactive Filter Toggle: `Last 5 Attempts` | `Last 10 Attempts` | `All Attempts`.
  - Tooltip: Date, Mock Title, Net Score, Correct, Wrong, Accuracy %.
- **C. Sectional Mastery & Accuracy:**
  - Dual visualization:
    - `RadarChart`: 4 axes (Reasoning, GA, Quant, English) representing accuracy %.
    - Horizontal `BarChart`: Side-by-side comparison of sectional scores (/50).
  - Highlights: Best section flagged with Green badge; weakest section flagged with Red badge.
- **D. Strength & Weakness Panel:**
  - Auto-computed Top 2 Strongest Sections (highest accuracy).
  - Auto-computed Bottom 2 Weakest Sections (lowest accuracy).
  - Sectional Wrong-Answer Rate (`Wrong / Attempted`).
  - Sectional Unattempted Rate (`Unanswered / 50`).
- **E. Time Analytics:**
  - Bar chart of average time spent per section (minutes).
  - Average time spent per question (seconds).
  - Overrun Alert Flag: Identifies which section candidate consistently exceeds the 45-minute per-section budget.
- **F. Negative Marking Leakage Card:**
  - Highlight statistic: **Total Marks Lost to Negative Marking** across all attempts (`wrongCount * 0.25`).
  - Stacked Bar Chart per attempt: Correct marks gained vs. Negative marks lost vs. Unattempted marks forgone.
  - Actionable advice snippet (e.g., *"Eliminating 12 wild guesses would increase your net score by +3.00 marks"*).
- **G. Topic/Chapter Heatmap:**
  - Visual grid of accuracy across extracted topic tags (e.g. Syllogisms, Arithmetic, Comprehension).
  - Graceful Fallback: If questions lack topic tags, card automatically hides without breaking layout.
- **H. Improvement Trend Badge:**
  - Compares rolling 3-attempt average against the preceding 3-attempt average.
  - Visual status pill:
    - `"Improving ↑ (+X.X)"` (Green)
    - `"Plateau → (±X.X)"` (Amber)
    - `"Declining ↓ (-X.X)"` (Red)
- **I. Countdown / Goal Setting Widget:**
  - If target exam date is configured: Shows `"X Days until Exam Day"`.
  - If not set: Interactive inline prompt allowing candidate to set target date and target net score.
- **J. Multi-Mock Strategic AI Mentor Card:**
  - Card with CTA: *"Generate Multi-Mock Strategic Audit"*.
  - Calls Groq AI mentor to synthesize patterns across attempts and output diagnostic advice.
- **K. Recent Attempts Table:**
  - Columns: Mock Title / ID, Completion Date, Net Score (/200), Accuracy %, Time Taken (hh:mm:ss), Action ("View Scorecard" button).
  - Interactive features: Zebra striping, hover highlight, sticky header.
- **Empty State (`DashboardEmptyState`):**
  - When candidate has 0 attempts: Friendly welcoming card with illustration/icon, *"Welcome to NBE Arena! Take your first full-length mock test to unlock deep analytics, sectional mastery charts, and AI diagnosis."* with prominent *"Start First Mock"* button.

---

### 3.4 Pre-Exam Rules / Instructions Screen (`/test/[mockId]/instructions`)
- Mandatory instructions gate prior to launching active test timer.
- Section breakdown (4 × 50), marking scheme (+1.00, -0.25, 0.00), target 150 benchmark.
- Mandatory disclaimer checkbox: *"I have read and understood all instructions."*
- "Begin Test" button enabled only after checkbox is checked.

---

### 3.5 Live CBT Test Interface (`/test/[mockId]`)
- 180-minute countdown timer with color alerts.
- Section tabs with dynamic answered counters.
- Question card with options, keyboard shortcuts `[1,2,3,4,N,P,M]`.
- 5-column sticky Question Palette.
- Real-time `localStorage` auto-persistence for mid-test recovery.
- Auto-submit on timer expiry.

---

### 3.6 Submit Confirmation Modal
- Summarizes answered, marked, and unanswered counts before final submission.

---

### 3.7 Results & Scorecard Screen (`/results/[attemptId]`)
- Scorecard Hero: Net score / 200, Qualifying Badge (>= 150 Green, < 150 Red), accuracy, time.
- Section-wise breakdown cards.
- Comprehensive question review list with filter tabs (All, Wrong, Correct, Skipped).

---

### 3.8 Admin Panel (`/admin`) — Admin Role Only
- Restricted to `role: "admin"`.
- "Active Users Right Now" card (heartbeats received in past 5 minutes) with quick link to `/admin/activity`.
- PDF Drag-and-drop uploader with live extraction queue.
- Candidate credentials editor (change username, password, display name).
- Question repository statistics and pool distribution.

---

### 3.9 Admin User Login & Activity Tracker (`/admin/activity`) — Admin Role Only
- **Purpose:** Full visibility into candidate and prospect usage across the 5 known users (sisters, friend, founder, test user, demo bot).
- **Access Guard:** Restricted strictly to `role: "admin"`. Non-admin requests receive HTTP 403 Forbidden.
- **Summary KPI Strip:**
  - Total Logins Today
  - Total Logins This Week
  - Total Logins This Month
  - Active Users Right Now (Heartbeat in last 5 minutes)
- **Per-User Activity Table:**
  - Columns:
    - Username & Display Name
    - Total Sessions Logged
    - Total Time Practiced (Hours:Minutes)
    - Last Active (Relative e.g. "12 minutes ago" + Absolute timestamp)
    - Last Device (Desktop / Mobile / Tablet)
    - Last Known IP (Masked for privacy if desired)
    - Approx Location (City, Country via GeoIP or "Unknown")
- **Chronological Session Timeline (Latest 50 Sessions):**
  - Detailed audit feed: User, Login Timestamp, Logout/Close Timestamp, Duration, IP Address, Device / OS / Browser, Pages Visited.
- **Interactive Controls:**
  - User filter dropdown (All users or specific candidate).
  - Date range filter (Today, Last 7 days, Last 30 days).
  - "Export CSV" button for offline reporting.

---

## 4. UI Design System Upgrade (SaaS-Grade Polish)

1. **Card Architecture:**
   - Soft border (`border border-slate-200 dark:border-slate-800`).
   - Rounded corners (`rounded-2xl`).
   - Soft subtle shadow (`shadow-sm hover:shadow-md transition-shadow`).
   - Consistent padding (`p-6 md:p-8`).
   - Uppercase eyebrow headers (`text-xs font-bold tracking-wider text-slate-500 uppercase`).

2. **Refined Navigation & Header:**
   - Sticky top bar with glassmorphism backdrop blur (`backdrop-blur-md bg-white/80 dark:bg-slate-900/80`).
   - Candidate avatar initials with dropdown menu (Profile info, Theme toggle, Sign out).
   - Admin badge indicator and direct admin switcher for privileged accounts.

3. **Refined Button Variants (shadcn standard):**
   - Primary: High-contrast brand blue with subtle active press effect.
   - Secondary: Slate outline with gentle hover fill.
   - Ghost: Transparent background for tertiary toolbar actions.
   - Destructive: Clear red for session logout / test abort confirmation.

4. **Tables:**
   - Zebra striping on alternating rows (`even:bg-slate-50 dark:even:bg-slate-800/50`).
   - Row hover elevation (`hover:bg-slate-100/70 dark:hover:bg-slate-800`).
   - Sticky header with clear column dividers.

5. **Loading & Feedback States:**
   - Skeleton shimmer cards matching exact widget dimensions during server-side data preparation.
   - Toast notifications (`react-hot-toast` or shadcn Toaster) for key user milestones (Login successful, Mock generated, Audit complete).

6. **Accessibility:**
   - Visible high-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-blue-500`).
   - Complete ARIA labels on all charts, palettes, and icon-only buttons.
   - Fully colorblind-safe categorical color assignments across charts.

---

## 5. Navigation & Authentication Flow

```text
[Visitor: /]
   ├── If Logged Out  ──> [Public Landing Page (/)] ──> [Sign In Button] ──> [/login]
   └── If Logged In   ──> [Auto-Redirect 302] ───────> [/dashboard]

[Candidate: /dashboard]
   ├── "Start Mock"   ──> [/test/[mockId]/instructions]
   │                         └── Check Disclaimer ──> "Begin Test" ──> [/test/[mockId]]
   │                                                                     └── Submit ──> [/results/[id]]
   └── If Admin       ──> Header Link to [/admin] ──> Link to [/admin/activity]

[Non-Admin: /admin or /admin/activity]
   └── Blocked with HTTP 403 / Redirect to /dashboard
```