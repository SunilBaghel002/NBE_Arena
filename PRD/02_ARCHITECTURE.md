# ARCHITECTURE.md
## NBE Arena — System Architecture

---

## 1. High-Level Architecture
┌─────────────────────────────────────────────────────────────┐
│ USER BROWSER │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│ │ Admin Panel │ │ Mock Lobby │ │ Live Test UI │ │
│ │ (Upload PDF)│ │ (Start Test)│ │ (200Q / 180min) │ │
│ └──────┬───────┘ └──────┬───────┘ └────────┬─────────┘ │
└─────────┼─────────────────┼────────────────────┼────────────┘
│ │ │
▼ ▼ ▼
┌─────────────────────────────────────────────────────────────┐
│ NEXT.js API ROUTES │
│ /api/upload /api/extract /api/generate-mock │
│ /api/submit /api/results /api/bank-stats │
└─────────┬─────────────────┬────────────────────┬────────────┘
│ │ │
▼ ▼ ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────────┐
│ PDF Pipeline │ │ Mock Engine │ │ Question Bank DB │
│ PDF→Images→LLM │ │ 50×4 random │ │ SQLite / JSON │
└────────┬─────────┘ └──────────────┘ └──────────────────────┘
│
▼
┌──────────────────┐
│ Vision LLM API │
│ GPT-4o / Claude │
│ / Gemini Flash │
└──────────────────┘

text


---

## 2. Folder Structure
nbe-arena/
├── prisma/
│ └── schema.prisma # If using SQLite
├── public/
│ └── uploads/ # Temp PDF storage
├── src/
│ ├── app/
│ │ ├── layout.tsx
│ │ ├── page.tsx # Home / Lobby
│ │ ├── admin/
│ │ │ └── page.tsx # PDF upload + bank stats
│ │ ├── test/
│ │ │ └── [mockId]/
│ │ │ └── page.tsx # Live test UI
│ │ ├── results/
│ │ │ └── [attemptId]/
│ │ │ └── page.tsx # Results + analytics
│ │ └── api/
│ │ ├── upload/route.ts
│ │ ├── extract/route.ts
│ │ ├── generate-mock/route.ts
│ │ ├── submit/route.ts
│ │ └── bank-stats/route.ts
│ ├── components/
│ │ ├── test/
│ │ │ ├── Timer.tsx
│ │ │ ├── QuestionCard.tsx
│ │ │ ├── QuestionPalette.tsx
│ │ │ ├── SectionTabs.tsx
│ │ │ └── TestHeader.tsx
│ │ ├── results/
│ │ │ ├── ScoreCard.tsx
│ │ │ ├── SectionBreakdown.tsx
│ │ │ └── WrongAnswers.tsx
│ │ └── admin/
│ │ ├── PdfUploader.tsx
│ │ └── BankStats.tsx
│ ├── lib/
│ │ ├── db.ts # Prisma client or JSON helpers
│ │ ├── pdf-to-images.ts
│ │ ├── vision-extract.ts # Vision LLM call
│ │ ├── mock-generator.ts
│ │ └── section-classifier.ts
│ ├── store/
│ │ └── testStore.ts # Zustand store for live test
│ └── types/
│ └── index.ts # Shared TypeScript types
├── data/
│ └── questions.json # Fallback JSON bank
├── .env.local # OPENAI_API_KEY / ANTHROPIC_API_KEY
├── package.json
└── README.md

text


---

## 3. Data Models

### 3.1 Question

```typescript
interface Question {
  id: string;                    // uuid
  section: "REASONING" | "GA" | "QUANT" | "ENGLISH";
  questionText: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctOption: "a" | "b" | "c" | "d";
  explanation?: string;
  hasImage: boolean;
  imagePath?: string;            // local path if diagram exists
  sourceExam: string;            // e.g. "SSC_CHSL_2023_Tier1"
  sourceYear?: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  isActive: boolean;             // soft-delete flag
  createdAt: string;             // ISO date
}
3.2 MockTest
TypeScript

interface MockTest {
  id: string;
  title: string;                 // "NBE Mock #3"
  createdAt: string;
  timeLimitMinutes: 180;
  sections: {
    REASONING: string[];         // array of question IDs (50)
    GA: string[];
    QUANT: string[];
    ENGLISH: string[];
  };
  totalQuestions: 200;
}
3.3 Attempt
TypeScript

interface Attempt {
  id: string;
  mockId: string;
  startedAt: string;
  submittedAt?: string;
  timeTakenSeconds?: number;
  answers: {
    questionId: string;
    selectedOption: "a" | "b" | "c" | "d" | null;
    status: "answered" | "marked" | "answered_marked" | "not_visited" | "unanswered";
    timeSpentSeconds?: number;
  }[];
  score?: {
    total: number;
    reasoning: number;
    ga: number;
    quant: number;
    english: number;
    correctCount: number:
    wrongCount: number;
    unansweredCount: number;
    netScore: number;
  };
}
4. PDF Extraction Pipeline (Critical Path)
text

Step 1: User uploads PDF via /admin
        → Save to /public/uploads/{uuid}.pdf

Step 2: POST /api/extract { pdfPath }
        → pdf-to-images.ts converts each page to PNG (150–200 DPI)

Step 3: For each page image:
        → vision-extract.ts sends image + system prompt to Vision LLM
        → LLM returns JSON array of questions found on that page

Step 4: section-classifier.ts
        → Validates section tag from LLM
        → Falls back to keyword heuristics if section missing

Step 5: Deduplicate
        → Hash questionText; skip near-duplicates

Step 6: Save to DB / questions.json
        → Return stats: { added: N, skipped: M, perSection: {...} }
Vision LLM System Prompt (MUST USE)
text

You are an expert exam-question extractor. 
From the provided exam paper page image, extract ALL multiple-choice questions.

Return ONLY valid JSON array. No markdown. No commentary.

Format:
[
  {
    "section": "REASONING" | "GA" | "QUANT" | "ENGLISH",
    "questionText": "full question text including any math in plain text/LaTeX",
    "options": { "a": "...", "b": "...", "c": "...", "d": "..." },
    "correctOption": "a" | "b" | "c" | "d" | null,
    "hasImage": true | false,
    "notes": "optional"
  }
]

Rules:
- If answer key is not on page, set correctOption to null
- If question needs a diagram you cannot describe, set hasImage true
- Classify section by content, not by page header alone
- Skip instructions, headers, page numbers
- QUANT: skip pure geometry/trigonometry if clearly advanced
- Preserve fractions as text like "3/4" or "1/2"
5. Mock Generation Algorithm
text

function generateMock(bank):
  pools = {
    REASONING: bank.filter(q => q.section == REASONING && q.isActive)
    GA: ...
    QUANT: ...
    ENGLISH: ...
  }

  assert each pool.length >= 50 else throw "Not enough questions in {section}"

  mock.sections.REASONING = sampleRandom(pools.REASONING, 50)
  mock.sections.GA        = sampleRandom(pools.GA, 50)
  mock.sections.QUANT     = sampleRandom(pools.QUANT, 50)
  mock.sections.ENGLISH   = sampleRandom(pools.ENGLISH, 50)

  // Optional: avoid questions used in last 2 mocks heavily
  save mock
  return mock
6. Live Test State Machine
text

IDLE → START_TEST → IN_PROGRESS → (SUBMIT | AUTO_SUBMIT) → SHOW_RESULTS
Zustand Store Shape
TypeScript

{
  mockId: string
  attemptId: string
  currentSection: "REASONING" | "GA" | "QUANT" | "ENGLISH"
  currentIndex: number          // 0–49 within section
  answers: Map<questionId, AnswerState>
  remainingSeconds: number      // starts 10800
  isSubmitted: boolean
  actions: {
    selectOption, markForReview, clearResponse,
    next, prev, jumpTo, changeSection,
    tick, submit
  }
}
7. API Contracts
POST /api/upload
Body: multipart form-data file
Res: { pdfId, path, pageCount }
POST /api/extract
Body: { pdfId }
Res: { extracted: number, bySection: { REASONING: n, GA: n, QUANT: n, ENGLISH: n }, errors: [] }
POST /api/generate-mock
Body: { title?: string }
Res: { mockId, title, questionCounts }
GET /api/mock/:mockId
Res: full mock with hydrated questions (options visible; correctOption HIDDEN until submit)
POST /api/submit
Body: { mockId, attemptId, answers[], timeTakenSeconds }
Res: { attemptId, score, breakdown }
GET /api/results/:attemptId
Res: full scorecard + wrong answer details + correct options revealed
GET /api/bank-stats
Res: { total, bySection, sources[] }
8. Security / Keys
Store LLM API key in .env.local only
Never expose key to client
All Vision calls server-side only
Uploaded PDFs stay local; do not commit to git
Add uploads/ and data/*.json to .gitignore


9. Performance Notes
PDF extraction is slow (Vision API per page). Show progress UI.
Process pages sequentially or max 3 concurrent to avoid rate limits.
Cache extracted results; don't re-extract same PDF.
Live test must feel instant — all questions loaded once at start.
Timer must be client-side with server timestamp validation on submit.