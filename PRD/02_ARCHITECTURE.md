# ARCHITECTURE.md
## NBE Arena — System Architecture

---

## 1. High-Level Architecture
```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                     CANDIDATE BROWSER                                  │
│ ┌──────────────┐ ┌──────────────────────┐ ┌───────────────────┐ ┌────────────────────┐ │
│ │ Login Screen │ │  Student Dashboard   │ │ Pre-Exam Rules    │ │ Live CBT Test Hall │ │
│ │  (/login)    │ │   (Past Attempts)    │ │ (/test/.../rules) │ │  (200Q / 180min)   │ │
│ └──────┬───────┘ └──────────┬───────────┘ └─────────┬─────────┘ └─────────┬──────────┘ │
└────────┼────────────────────┼───────────────────────┼─────────────────────┼────────────┘
         │                    │                       │                     │
         ▼                    ▼                       ▼                     ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  NEXT.JS 14 APP ROUTER                                 │
│  NextAuth.js (Credentials + JWT)  │  Zod Schema Validation  │  Zustand + LocalStorage  │
│                                                                                        │
│  API Routes:                                                                           │
│  - /api/auth/[...nextauth]         - /api/generate-mock       - /api/bank-stats        │
│  - /api/mock/[mockId]              - /api/submit              - /api/results/[id]      │
│  - /api/attempts/user              - /api/upload (Admin)      - /api/extract (Admin)   │
└─────────────────────────────────────────────┬──────────────────────────────────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     ▼                                                 ▼
        ┌───────────────────────────┐                    ┌───────────────────────────┐
        │       MONGODB ATLAS       │                    │      VISION LLM API       │
        │   (Mongoose ODM Cloud)    │                    │  GPT-4o / Claude / Gemini │
        │  - Users (admin/student)  │                    │                           │
        │  - Questions (200+ pool)  │                    │  High-DPI PDF Page Image  │
        │  - MockTests (200Q specs) │                    │  Extraction Pipeline      │
        │  - Attempts (with userId) │                    └───────────────────────────┘
        └───────────────────────────┘
```

---

## 2. Folder Structure
```text
nbe-arena/
├── public/
│   └── uploads/                  # Temporary PDF page image render directory
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with SessionProvider
│   │   ├── page.tsx              # Student Dashboard / Personalized Lobby
│   │   ├── login/
│   │   │   └── page.tsx          # Credentials Login Page
│   │   ├── admin/
│   │   │   └── page.tsx          # PDF upload + bank stats (Admin role protected)
│   │   ├── test/
│   │   │   └── [mockId]/
│   │   │       ├── instructions/
│   │   │       │   └── page.tsx  # Pre-exam CBT Rules & Disclaimer Screen
│   │   │       └── page.tsx      # Live CBT Test Hall (180 min timer starts here)
│   │   ├── results/
│   │   │   └── [attemptId]/
│   │   │       └── page.tsx      # Scorecard + Wrong Answer Solution Review
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/route.ts  # NextAuth handler (Credentials)
│   │       ├── upload/route.ts
│   │       ├── extract/route.ts
│   │       ├── generate-mock/route.ts
│   │       ├── mock/[mockId]/route.ts
│   │       ├── submit/route.ts
│   │       ├── results/[attemptId]/route.ts
│   │       ├── bank-stats/route.ts
│   │       └── attempts/
│   │           └── route.ts      # User-specific test history
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginForm.tsx
│   │   ├── dashboard/
│   │   │   ├── AttemptHistory.tsx
│   │   │   ├── PerformanceChart.tsx
│   │   │   └── AvailableMocks.tsx
│   │   ├── test/
│   │   │   ├── TestHeader.tsx
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── QuestionPalette.tsx
│   │   │   └── SubmitModal.tsx
│   │   ├── results/
│   │   │   ├── ScoreHero.tsx
│   │   │   ├── SectionBreakdown.tsx
│   │   │   └── QuestionReviewList.tsx
│   │   └── admin/
│   │       ├── PdfUploader.tsx
│   │       └── BankStatsCards.tsx
│   ├── lib/
│   │   ├── mongodb.ts            # Mongoose singleton connection pool
│   │   ├── auth.ts               # NextAuth configuration options
│   │   ├── mock-generator.ts     # 50x4 random sampler
│   │   ├── scoring.ts            # -0.25 negative marking engine
│   │   ├── vision-extract.ts     # Vision LLM adapter
│   │   └── section-classifier.ts # Heuristic fallback
│   ├── models/                   # Mongoose ODM Models
│   │   ├── User.ts               # User schema (username, password, role)
│   │   ├── Question.ts           # Question schema
│   │   ├── MockTest.ts           # MockTest schema
│   │   └── Attempt.ts            # Attempt schema with userId
│   ├── store/
│   │   └── testStore.ts          # Zustand store for live test session
│   └── types/
│       └── index.ts              # Shared TypeScript definitions
├── data/
│   ├── seed-questions.json       # 200 authentic bootstrap questions
│   └── pyq/                      # Past year exam source PDFs
├── .env.local                    # MONGODB_URI, NEXTAUTH_SECRET, API Keys
├── package.json
└── README.md
```

---

## 3. Data Models (Mongoose & TypeScript)

### 3.1 User Model
```typescript
interface User {
  id: string;
  username: string;              // unique login identifier
  passwordHash: string;          // bcrypt hashed password
  name: string;                  // display name
  role: "admin" | "student";     // RBAC
  createdAt: string;
}
```

### 3.2 Question Model
```typescript
interface Question {
  id: string;                    // unique slug or uuid
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
  imagePath?: string;
  sourceExam: string;            // e.g. "SSC_CHSL_2023_Tier1", "NBE_2015"
  sourceYear?: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  isActive: boolean;
  createdAt: string;
}
```

### 3.3 MockTest Model
```typescript
interface MockTest {
  id: string;
  title: string;                 // "NBE Mock #1"
  createdAt: string;
  timeLimitMinutes: 180;
  totalQuestions: 200;
  sections: {
    REASONING: string[];         // 50 question IDs
    GA: string[];
    QUANT: string[];
    ENGLISH: string[];
  };
}
```

### 3.4 Attempt Model (Linked to `userId`)
```typescript
interface Attempt {
  id: string;
  userId: string;                // References User._id
  mockId: string;                // References MockTest.id
  startedAt: string;
  submittedAt?: string;
  timeTakenSeconds: number;
  answers: {
    questionId: string;
    selectedOption: "a" | "b" | "c" | "d" | null;
    status: "answered" | "marked" | "answered_marked" | "not_visited" | "unanswered";
    timeSpentSeconds?: number;
  }[];
  score?: {
    totalQuestions: number;      // 200
    correctCount: number;
    wrongCount: number;
    unansweredCount: number;
    rawScore: number;            // +1 per correct
    negativePenalty: number;     // 0.25 * wrongCount
    netScore: number;            // rawScore - negativePenalty
    accuracyPercentage: number;
    qualifyingCleared: boolean;  // netScore >= 150
    targetScore: 150;
    bySection: Record<string, SectionScore>;
  };
}
```

---

## 4. Authentication & RBAC Flow

```text
Unauthenticated User → Navigates to app → Redirected to /login
                    ↓
Candidate enters username + password → NextAuth verifies bcrypt hash
                    ↓
Session JWT created with { id, username, name, role }
                    ↓
Role = "student" → Access / (Dashboard), /test/..., /results/...
Role = "admin"   → Access Dashboard + /admin (PDF extraction pipeline)
```

---

## 5. Pre-Exam Rules & Live Test State Flow

```text
[Student Dashboard]
        │
        ▼ (Clicks "Start Mock")
[/test/[mockId]/instructions]
  - Displays: 200 Qs, 180 Mins, 4 Sections x 50, +1 / -0.25 Marking Scheme
  - Checkbox: [x] "I have read and understood the instructions"
  - "Begin Test" button enabled ONLY after checkbox checked
        │
        ▼ (Clicks "Begin Test")
[/test/[mockId]]
  - 180-Minute Countdown Timer STARTS (10800s)
  - Questions hydrated (correctOption HIDDEN)
  - Palette active (Answered / Unanswered / Marked / Not Visited)
  - LocalStorage auto-persistence on every click
        │
        ▼ (Manual Submit or Timer Zero)
[/results/[attemptId]]
  - Calculates Net Score = Correct - (Wrong * 0.25)
  - Scorecard Hero + 150 Qualifying Target status
  - Full Question-by-Question Solution & Answer Key Review
```

---

## 6. Environment Configuration (Cloud Ready)
```env
# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nbe_arena?retryWrites=true&w=majority
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/nbe_arena?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=a_very_secure_random_jwt_secret_key_32_chars

# Vision LLM Provider Configuration
VISION_PROVIDER=openai
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
```