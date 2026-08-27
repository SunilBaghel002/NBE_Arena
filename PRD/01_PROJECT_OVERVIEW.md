# PROJECT OVERVIEW
## NBE Junior Assistant Mock Test Platform
### Codename: "NBE Arena"

---

## 1. Problem Statement

The National Board of Examinations in Medical Sciences (NBEMS) Junior Assistant exam has almost **zero publicly available mock tests**. Only one official PYQ paper exists (up to 2015). Candidates cannot practice the real exam format (200 questions, 180 minutes, 4 sections × 50).

However, the syllabus and pattern are nearly identical to:
- SSC CHSL (Tier-1)
- SSC CGL (Tier-1)
- SSC MTS
- DSSSB LDC / Junior Assistant
- SSC Selection Post (Matric / Higher Secondary)

**Solution:** Build a cloud-hosted (Vercel + MongoDB Atlas) CBT platform that extracts questions from these exam PDFs using Vision LLM, stores them in a MongoDB repository, authenticates candidates via NextAuth, provides personal dashboards with progress analytics, enforces pre-exam CBT instruction screens, and generates unlimited NBE-format mock tests (200 Qs, 50 per section, 180 min timer).

---

## 2. Product Goals

| Goal | Success Metric |
|------|----------------|
| Generate authentic NBE-format mocks | 200 Qs = 50 Reasoning + 50 GA + 50 Quant + 50 English |
| Exact exam timer | 180-minute countdown starting only after pre-exam instructions confirmation |
| Pre-Exam Rules Screen | Mandatory disclaimer & rules review before CBT timer begins |
| Cloud Database Persistence | MongoDB Atlas via Mongoose storing questions, mocks, attempts, and users |
| Authentication & Personal Dashboards | NextAuth Credentials login; student dashboard showing personal test attempts & progress |
| Role-Based Admin Protection | Only users with `role: "admin"` can access `/admin` for PDF uploads |
| PDF ingestion pipeline | Upload SSC/DSSSB PYQ PDFs → Vision LLM auto-extract to structured MongoDB questions |
| Exam-hall UI simulation | Palette, mark-for-review, section tabs, auto-submit, local storage persistence |
| Post-test analytics | Score /200 with -0.25 negative marking, section breakdown, wrong-answer review, 150 benchmark |

---

## 3. Target User & Deployment

- **Primary Users:** Multiple candidate friends preparing together for NBE Junior Assistant exam.
- **Deployment:** Vercel cloud deployment + MongoDB Atlas.
- **Access Control:**
  - `student`: Access to personal dashboard, mock generator, test hall, scorecards, and solution reviews.
  - `admin`: Full student access plus `/admin` panel to upload PDFs and manage question repositories.
- **Device:** Desktop / laptop browser (exam is computer-based).

---

## 4. Core Features (Must-Have)

### 4.1 Authentication & Multi-Candidate Dashboards
- NextAuth.js Credentials Provider with secure password hashing (`bcryptjs`).
- User roles: `admin` and `student`.
- Student Dashboard: Displays personalized past test attempts, net scores, accuracy %, average time taken, and available mocks.
- `Attempt` records linked via `userId`.

### 4.2 Pre-Exam Rules & Instructions Screen
- When a candidate clicks "Start Mock", route to `/test/[mockId]/instructions`.
- Displays exam rules: 200 Questions, 180 Minutes, 4 Sections × 50, +1.00 Correct, -0.25 Wrong, 0 Unattempted.
- Mandatory disclaimer checkbox: *"I have read and understood the instructions"*.
- "Begin Test" button remains disabled until checkbox is checked.
- 180-minute CBT countdown timer begins ONLY after clicking "Begin Test".

### 4.3 PDF Ingestion Engine
- Accept multi-page PYQ PDFs (SSC CHSL, MTS, DSSSB, NBE 2015).
- High-DPI page rendering to PNG images.
- Multimodal Vision LLM extraction (GPT-4o / Claude 3.5 Sonnet / Gemini 1.5 Flash).
- Auto-classify into 4 sections, deduplicate with SHA-256, and persist in MongoDB Atlas.

### 4.4 Mock Test Generator
- Pull 50 random questions from each section pool in MongoDB.
- Assemble into 200-question NBE mock (50 Reasoning, 50 GA, 50 Quant, 50 English).
- Filter out complex geometry/trigonometry from Quant pool.

### 4.5 Live CBT Test Interface
- 180-minute countdown timer with color warnings (30m/10m/5m).
- 4 section tabs with answered counts.
- 5-column Question Palette (Answered, Not Answered, Marked for Review, Not Visited, Current).
- Save & Next, Mark for Review, Clear Response, Keyboard shortcuts `[1,2,3,4,N,P,M]`.
- Auto-save to localStorage to survive mid-test reloads.
- Auto-submit on timer zero & modal confirmation.

### 4.6 Results & Analytics Engine
- Total score out of 200 calculated as $\text{Net Score} = \text{Correct} - (0.25 \times \text{Wrong})$.
- Section-wise breakdown (/50 each) with section net scores and accuracy.
- Comparison against 150/200 qualifying benchmark.
- Question-by-question review revealing correct options and explanations.

### 4.7 Admin Panel (Admin Role Only)
- Protected by NextAuth middleware (restricted to `role: "admin"`).
- Drag-drop PDF uploader, extraction progress tracking, and question repository statistics.

---

## 5. Out of Scope (Do NOT Build)

- Payment gateways / commercial billing subscriptions
- Mobile native apps (desktop/laptop browser is the CBT target)
- Live multiplayer head-to-head racing
- Hindi language translation
- Automatic diagram problem solving for image-only non-verbal questions

---

## 6. Exam Pattern Reference (Source of Truth)

| Section | Questions | Marks |
|---------|-----------|-------|
| General Intelligence & Reasoning | 50 | 50 |
| General Awareness | 50 | 50 |
| Quantitative Aptitude | 50 | 50 |
| English Comprehension | 50 | 50 |
| **TOTAL** | **200** | **200** |
| **Duration** | **180 minutes** | |
| **Marking Scheme** | **+1.00 Correct, -0.25 Wrong, 0 Blank** | |
| **Target to Qualify** | **150 / 200 (75% Net)** | |

---

## 7. Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| UI Components | shadcn/ui style components + Lucide Icons |
| Database | MongoDB Atlas via Mongoose ODM (`MONGODB_URI`) |
| Authentication | NextAuth.js (Auth.js) Credentials Provider + JWT sessions |
| PDF → Image | `pdfjs-dist` / `pdf2image` / Canvas rendering |
| Vision LLM | OpenAI GPT-4o / Anthropic Claude 3.5 Sonnet / Google Gemini 1.5 Flash |
| State Management | Zustand store for live CBT session + LocalStorage persistence |
| Hosting | Vercel (`npm run build`) |