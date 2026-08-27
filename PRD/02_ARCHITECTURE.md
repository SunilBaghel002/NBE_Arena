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
│  - /api/attempts/user              - /api/admin/users         - /api/extract (Admin)   │
└─────────────────────────────────────────────┬──────────────────────────────────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     ▼                                                 ▼
        ┌───────────────────────────┐                    ┌───────────────────────────┐
        │       MONGODB ATLAS       │                    │  HYBRID EXTRACTION ENGINE │
        │   (Mongoose ODM Cloud)    │                    │                           │
        │  - Users (admin/student)  │                    │ Path A: Text Parser (Groq)│
        │  - Questions (200+ pool)  │                    │ Path B: Vision VLM        │
        │  - MockTests (200Q specs) │                    │  (OpenRouter Qwen2.5-VL   │
        │  - Attempts (with userId) │                    │   / Gemini Flash / Ollama)│
        └───────────────────────────┘                    └───────────────────────────┘
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
│   │   │   └── page.tsx          # PDF upload + bank stats + candidate tracker (Admin)
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
│   │       ├── admin/
│   │       │   └── users/route.ts          # Candidate management & credentials editor
│   │       ├── upload/route.ts
│   │       ├── extract/route.ts            # Hybrid PDF extraction route
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
│   │       └── CandidateProgressTracker.tsx
│   ├── lib/
│   │   ├── mongodb.ts            # Mongoose singleton connection pool
│   │   ├── auth.ts               # NextAuth configuration options
│   │   ├── pdf-pipeline.ts       # Orchestrator for Hybrid Extraction
│   │   ├── pdf-to-images.ts      # High-DPI Page Renderer (150-200 DPI)
│   │   ├── text-extract.ts       # Path A: Text-layer direct extraction (Groq)
│   │   ├── vision-extract.ts     # Path B: Vision VLM Adapter (OpenRouter / Gemini / Ollama)
│   │   ├── mock-generator.ts     # 50x4 random sampler
│   │   ├── scoring.ts            # -0.25 negative marking engine
│   │   ├── dedupe.ts             # SHA-256 deduplication
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
├── .env.local                    # MONGODB_URI, NEXTAUTH_SECRET, Provider API Keys
├── package.json
└── README.md
```

---

## 3. Hybrid AI Pipeline Architecture

```text
[PDF Upload] ──> [pdf-pipeline.ts]
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
[Text-Layer Detected?]      [Scanned / Complex Page?]
        │                           │
        ▼ (Path A)                  ▼ (Path B)
 [text-extract.ts]          [pdf-to-images.ts] ──> [vision-extract.ts]
 (Groq Llama 3.3)                                  (OpenRouter Qwen2.5-VL / Gemini Flash)
        │                                                   │
        └─────────────────────┬─────────────────────────────┘
                              ▼
                   [section-classifier.ts]
                              ▼
                     [dedupe.ts (SHA-256)]
                              ▼
                   [MongoDB Atlas Upsert]
```

### 3.1 Vision Provider Adapter Pattern (`src/lib/vision-extract.ts`)
An extensible interface that delegates image-based MCQ extraction to the configured provider:
- `OpenRouterAdapter`: Calls OpenRouter API targeting `qwen/qwen-2.5-vl-7b-instruct` or fallback models with explicit `max_tokens`.
- `GeminiAdapter`: Calls Google Gemini 2.0 Flash with inline image parts.
- `OllamaAdapter`: Calls local Ollama vision endpoint (`/api/generate` or `/api/chat`).

### 3.2 Text Parser Adapter (`src/lib/text-extract.ts`)
- `GroqTextAdapter`: Direct high-speed text parser using Groq's `llama-3.3-70b-versatile` / `llama-3.1-8b-instant`.
- `OpenRouterTextAdapter`: Secondary text parsing fallback.

---

## 4. Data Models (Mongoose & TypeScript)

### 4.1 User Model
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

### 4.2 Question Model
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
  correctOption: "a" | "b" | "c" | "d" | null;
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

### 4.3 MockTest Model
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

### 4.4 Attempt Model (Linked to `userId`)
```typescript
interface Attempt {
  id: string;
  userId: string;                // References User._id
  userName?: string;
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
  score?: AttemptScore;
}
```

---

## 5. Environment Configuration

```env
# MongoDB Atlas Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nbe_arena?retryWrites=true&w=majority
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/nbe_arena?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=a_very_secure_random_jwt_secret_key_32_chars

# Vision Provider Configuration (Path B)
VISION_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_VISION_MODEL=qwen/qwen-2.5-vl-7b-instruct
OPENROUTER_FALLBACK_MODEL=openai/gpt-4o-mini

GEMINI_API_KEY=AIzaSy...
GEMINI_VISION_MODEL=gemini-2.0-flash

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_VISION_MODEL=qwen2.5-vl:7b

# Text Provider Configuration (Path A - Text Pages Only)
TEXT_PROVIDER=groq
GROQ_API_KEY=gsk_...
GROQ_TEXT_MODEL=llama-3.3-70b-versatile
```