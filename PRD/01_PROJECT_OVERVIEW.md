# PROJECT OVERVIEW
## NBE Junior Assistant Mock Test Platform
### Codename: "NBE Arena"

---

## 1. Problem Statement

The National Board of Examinations in Medical Sciences (NBEMS) Junior Assistant exam has almost **zero publicly available mock tests**. Only one PYQ paper exists (up to 2015). Candidates cannot practice the real exam format (200 questions, 180 minutes, 4 sections × 50).

However, the syllabus and pattern are nearly identical to:
- SSC CHSL (Tier-1)
- SSC CGL (Tier-1)
- SSC MTS
- DSSSB LDC / Junior Assistant
- SSC Selection Post (Matric / Higher Secondary)

**Solution:** Build a platform that extracts questions from these exam PDFs using Vision LLM, stores them in a structured pool, and generates unlimited NBE-format mock tests (200 Qs, 50 per section, 180 min timer).

---

## 2. Product Goals

| Goal | Success Metric |
|------|----------------|
| Generate authentic NBE-format mocks | 200 Qs = 50 Reasoning + 50 GA + 50 Quant + 50 English |
| Exact exam timer | 180-minute countdown with section tracking |
| Unlimited mocks from pool | Minimum 8–10 unique full mocks from question bank |
| PDF ingestion pipeline | Upload SSC/DSSSB PYQ PDFs → auto-extract to JSON |
| Exam-hall UI simulation | Palette, mark-for-review, section tabs, auto-submit |
| Post-test analytics | Score /200, section-wise accuracy, time per section, wrong-answer review |
| Target qualifying score display | Highlight 150/200 benchmark |

---

## 3. Target User

- **Primary:** One candidate preparing for NBE Junior Assistant exam
- **Usage window:** 4–6 days of intensive mock practice
- **Technical comfort:** Non-technical end user; UI must be dead simple
- **Device:** Desktop/laptop browser (exam is computer-based)

---

## 4. Core Features (Must-Have)

### 4.1 PDF Ingestion Engine
- Accept multi-page PYQ PDFs (SSC CHSL, CGL, MTS, DSSSB)
- Convert PDF pages → images
- Send images to Vision LLM (GPT-4o / Claude 3.5 / Gemini 1.5)
- Extract structured questions as JSON
- Auto-classify into 4 sections based on content
- Store in local JSON database / SQLite

### 4.2 Mock Test Generator
- Pull 50 random questions from each section pool
- Assemble into one 200-question NBE mock
- Assign unique mock ID
- Support generating Mock 1, Mock 2 … Mock N without question repetition within a single mock
- Filter out Advanced Maths (Geometry heavy, Trigonometry) if flagged — NBE syllabus says "not complicated arithmetical computation"

### 4.3 Live Test Interface
- 180-minute global countdown timer
- 4 section tabs (Reasoning | GA | Quant | English)
- Question palette (answered / unanswered / marked / not visited)
- Save & Next, Mark for Review, Clear Response
- Auto-submit on timer zero
- Confirm before manual submit

### 4.4 Results & Analytics
- Total score out of 200
- Section-wise breakdown (X/50)
- Accuracy percentage
- Time spent per section
- List of wrong answers with correct option
- Comparison vs 150 qualifying target
- Option to review full paper

### 4.5 Admin / Setup Panel (Developer-facing)
- Upload PDF button
- Trigger extraction pipeline
- View question bank stats (count per section)
- Generate new mock button
- Reset / clear bank

---

## 5. Out of Scope (Do NOT Build)

- User authentication / multi-user accounts
- Payment / subscription
- Mobile native apps
- Live multiplayer
- Backend cloud deployment (local-first is fine)
- Hindi language support
- Negative marking mandatory -0.25
- Add net-score analytics requirement
- Image-based non-verbal reasoning auto-solving (store image ref if present; skip if unusable)

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
| **Target to Qualify** | **150 / 200** | |

---

## 7. Syllabus Mapping for Section Classification

### Reasoning
Analogies, Classification, Series (Number/Alphabet/Figural), Coding-Decoding, Blood Relations, Direction, Venn, Syllogism, Statement-Conclusion, Embedded Figures, Mirror/Water Image, Paper Folding, Ranking, Mathematical Operations

### General Awareness
History, Geography, Polity, Economy, General Science, Current Affairs, Static GK, Culture, Computer Basics

### Quantitative Aptitude
Number System, Percentage, Ratio & Proportion, Averages, SI/CI, Profit & Loss, Discount, Partnership, Mixture & Allegation, Time & Work, Time-Speed-Distance, Fractions, Decimals, Square Roots, Basic Algebra identities
**(EXCLUDE heavy Geometry, Trigonometry, Mensuration advanced)**

### English
Reading Comprehension, Error Spotting, Fill in Blanks, Synonyms/Antonyms, Idioms, One-word Substitution, Sentence Improvement, Cloze Test, Spelling, Active-Passive, Direct-Indirect

---

## 8. Tech Stack Preference (AI Agent Should Follow)

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| UI Components | shadcn/ui |
| Backend / API | Next.js API Routes |
| Database | SQLite via Prisma OR JSON file store (local-first) |
| PDF → Image | `pdf-poppler` or `pdfjs-dist` or Python `pdf2image` sidecar |
| Vision LLM | OpenAI GPT-4o OR Anthropic Claude 3.5 Sonnet OR Google Gemini 1.5 Flash |
| State (test UI) | Zustand or React Context |
| Charts (results) | Recharts |
| Hosting | Localhost first (`npm run dev`) |

---

## 9. Success Definition

Platform is DONE when:
1. User can upload 3+ PYQ PDFs
2. System extracts ≥ 400 usable questions across 4 sections
3. User can generate and attempt a full 200-Q / 180-min mock
4. Results screen shows score, section breakdown, and wrong answers
5. User can generate at least 6 unique mocks without crashing