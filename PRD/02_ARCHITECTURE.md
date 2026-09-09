# ARCHITECTURE.md
## NBE Arena — System Architecture

---

## 1. High-Level Architecture
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                            BROWSER CLIENT                                              │
│ ┌────────────────┐ ┌──────────────┐ ┌────────────────────┐ ┌───────────────────┐ ┌───────────────────┐ │
│ │ Public Landing │ │ Login Screen │ │ Student Dashboard  │ │ Pre-Exam Rules    │ │ Live CBT Hall     │ │
│ │     (/)        │ │   (/login)   │ │   (/dashboard)     │ │ (/test/.../rules) │ │ (200Q / 180min)   │ │
│ └───────┬────────┘ └──────┬───────┘ └─────────┬──────────┘ └─────────┬─────────┘ └─────────┬─────────┘ │
│         │                 │                   │                      │                     │           │
│         │                 │                   ▼                      │                     │           │
│         │                 │         ┌───────────────────┐            │                     │           │
│         │                 │         │ Heartbeat (60s)   │            │                     │           │
│         │                 │         │ (/api/session/...)│            │                     │           │
│         │                 │         └─────────┬─────────┘            │                     │           │
│         │                 │                   │                      │                     │           │
│         │                 │ ┌─────────────────┴──────────────────┐   │                     │           │
│         │                 │ │ Admin Activity (/admin/activity)   │   │                     │           │
│         │                 │ └─────────────────┬──────────────────┘   │                     │           │
└─────────┼─────────────────┼───────────────────┼──────────────────────┼─────────────────────┼───────────┘
          │                 │                   │                      │                     │
          ▼                 ▼                   ▼                      ▼                     ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         NEXT.JS 14 APP ROUTER                                          │
│  NextAuth.js (Credentials + JWT)  │  Zod Schema Validation  │  Zustand + LocalStorage  │  Recharts     │
│                                                                                                        │
│  API Routes:                                                                                           │
│  - /api/auth/[...nextauth]         - /api/generate-mock       - /api/bank-stats                        │
│  - /api/mock/[mockId]              - /api/submit              - /api/results/[id]                      │
│  - /api/attempts/user              - /api/admin/users         - /api/extract (Admin)                   │
│  - /api/session/ping (Heartbeat)   - /api/session/logout      - /api/admin/activity (Admin Only)       │
└───────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
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
              │  - LoginSessions (audits) │                    │                           │
              └───────────────────────────┘                    └───────────────────────────┘
```

---

## 2. Folder Structure
```text
nbe-arena/
├── public/
│   ├── og-image.png              # OpenGraph social share card
│   └── uploads/                  # Temporary PDF page image render directory
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with SessionProvider & Global Toaster
│   │   ├── page.tsx              # Public Landing Page (Redirects to /dashboard if logged in)
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Advanced Student Dashboard (11 Analytics Modules)
│   │   ├── login/
│   │   │   └── page.tsx          # Credentials Login Page
│   │   ├── admin/
│   │   │   ├── page.tsx          # Ingestion + Bank stats + Active Now card
│   │   │   └── activity/
│   │   │       └── page.tsx      # User Session Audit & Tracking Dashboard (Admin only)
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
│   │       │   └── [...nextauth]/route.ts  # NextAuth handler (Credentials + session tracking)
│   │       ├── session/
│   │       │   ├── ping/route.ts           # 60s client heartbeat & breadcrumb logger
│   │       │   └── logout/route.ts         # Explicit logout session closer
│   │       ├── admin/
│   │       │   ├── users/route.ts          # Candidate management & credentials editor
│   │       │   └── activity/route.ts       # Admin session audit feed & stats
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
│   │   ├── landing/              # Public Marketing Landing Page Components
│   │   │   ├── LandingNavbar.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── TrustStrip.tsx
│   │   │   ├── FeatureGrid.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── AnalyticsPreview.tsx
│   │   │   ├── TargetAudience.tsx
│   │   │   ├── PricingTiers.tsx
│   │   │   ├── ContactModal.tsx
│   │   │   └── LandingFooter.tsx
│   │   ├── dashboard/            # Student Dashboard Components
│   │   │   ├── EnhancedKpiRow.tsx
│   │   │   ├── ScoreTrajectoryChart.tsx
│   │   │   ├── SectionalMasteryCharts.tsx
│   │   │   ├── StrengthWeaknessPanel.tsx
│   │   │   ├── TimeAnalyticsChart.tsx
│   │   │   ├── NegativeMarkingLeakageCard.tsx
│   │   │   ├── TopicHeatmap.tsx
│   │   │   ├── ImprovementTrendBadge.tsx
│   │   │   ├── CountdownGoalWidget.tsx
│   │   │   ├── AvailableMocks.tsx
│   │   │   ├── RecentAttemptsTable.tsx
│   │   │   └── DashboardEmptyState.tsx
│   │   ├── admin/
│   │   │   ├── PdfUploader.tsx
│   │   │   ├── CandidateProgressTracker.tsx
│   │   │   └── activity/
│   │   │       ├── ActiveUsersCard.tsx
│   │   │       ├── UserSessionTable.tsx
│   │   │       └── SessionTimeline.tsx
│   │   ├── auth/
│   │   │   └── LoginForm.tsx
│   │   ├── test/
│   │   │   ├── TestHeader.tsx
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── QuestionPalette.tsx
│   │   │   └── SubmitModal.tsx
│   │   ├── results/
│   │   │   ├── ScoreHero.tsx
│   │   │   ├── SectionBreakdown.tsx
│   │   │   └── QuestionReviewList.tsx
│   │   └── ui/                   # SaaS Design Tokens & UI Elements
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Skeleton.tsx
│   │       ├── Badge.tsx
│   │       └── Toast.tsx
│   ├── lib/
│   │   ├── mongodb.ts            # Mongoose singleton connection pool
│   │   ├── auth.ts               # NextAuth configuration options
│   │   ├── session-tracker.ts    # Session creation, heartbeat & inactivity closer
│   │   ├── analytics-helpers.ts  # Pre-computation of metrics (strengths, leakage, rolling avg)
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
│   │   ├── Attempt.ts            # Attempt schema with userId
│   │   └── LoginSession.ts       # Session tracking & audit schema
│   ├── store/
│   │   └── testStore.ts          # Zustand store for live test session
│   └── types/
│       └── index.ts              # Shared TypeScript definitions
│       └── analytics.ts          # Dashboard & Tracking interfaces
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

### 4.5 LoginSession Model (Audit & Activity Tracking)
```typescript
interface LoginSession {
  id: string;                    // unique session id / MongoDB _id
  userId: string;                // References User._id
  username: string;              // Cached username
  loginAt: Date;                 // Session start timestamp
  logoutAt?: Date;               // Explicit logout timestamp (if triggered)
  sessionDurationSeconds: number;// Duration calculated on logout or inactivity
  ipAddress?: string;            // Client IP extracted from x-forwarded-for or headers
  userAgent?: string;            // Raw User-Agent string
  device: "Desktop" | "Mobile" | "Tablet" | "Unknown"; // Parsed device classification
  approxLocation?: string | null;// City, Country (best-effort GeoIP, or null)
  pagesVisited?: string[];       // Lightweight page breadcrumbs (e.g. ["/dashboard", "/test/mock-1"])
  lastActivityAt: Date;          // Updated every 60s via client heartbeat ping
  createdAt: Date;
}
```

---

## 5. Analytics Data-Fetch Architecture (`/dashboard`)

The Phase 2 Advanced Dashboard follows a **Server-Orchestrated, Client-Rendered** architecture to guarantee fast initial loads with zero API waterfalls:

```text
[User Request: /dashboard]
          │
          ▼
[React Server Component: src/app/dashboard/page.tsx]
  ├── Authenticate session via getServerSession(authOptions)
  │     └── If no session -> redirect("/login")
  ├── Direct MongoDB Mongoose Query (Lean):
  │     ├── Attempt.find({ userId: session.user.id }).sort({ submittedAt: 1 }).lean()
  │     └── Question / Mock metadata (as needed)
  ├── Server-Side Aggregation & Analytics Pre-Computation:
  │     ├── KPI totals (completed, average, best, accuracy, total practice hours, gap from 150)
  │     ├── Trajectory points with rolling averages (Last 5, 10, All)
  │     ├── Sectional mastery (Radar coordinates + Horizontal bar accuracies)
  │     ├── Strengths (Top 2 sections) & Weaknesses (Bottom 2 sections + error rates)
  │     ├── Time analytics (Time per section, time per question, overrun detection)
  │     ├── Negative marking leakage (Total marks lost, stacked bar correct/wrong/unattempted)
  │     └── Target countdown & Exam date goal
  └── Render Page Frame & Inject Pre-Calculated Data Props into Client Chart Components:
        ├── <EnhancedKpiRow initialData={...} />
        ├── <ScoreTrajectoryChart initialData={...} />
        ├── <SectionalMasteryCharts initialData={...} />
        ├── <StrengthWeaknessPanel initialData={...} />
        ├── <TimeAnalyticsChart initialData={...} />
        ├── <NegativeMarkingLeakageCard initialData={...} />
        └── <RecentAttemptsTable attempts={...} />
```

### Key Principles:
1. **Zero Client Waterfalls:** All historical attempt aggregation is calculated on the server in a single database roundtrip.
2. **Recharts in Client Leaves:** Only chart containers are marked `'use client'`, keeping JavaScript bundles minimal.
3. **Empty State Guard:** When `attempts.length === 0`, server gracefully renders `<DashboardEmptyState />` without invoking chart computations.

---

## 6. Session Lifecycle & Activity Heartbeat Architecture

To track usage of the 5 controlled users (sisters, friend, founder, test user, demo bot):

```text
       USER LOGS IN (/login)
                 │
                 ▼
  [NextAuth Credentials Handler]
  - Verifies bcrypt password
  - Creates LoginSession document in MongoDB Atlas
  - Stores sessionId in JWT / session token
                 │
                 ▼
       ACTIVE BROWSER SESSION
  [Client Component: SessionHeartbeatProvider]
  - Fires every 60 seconds to POST /api/session/ping
  - Sends: { sessionId, currentPage }
  - Server updates: lastActivityAt = new Date(), pushes currentPage to pagesVisited
                 │
        ┌────────┴────────┐
        ▼                 ▼
[EXPLICIT LOGOUT]   [INACTIVITY TIMEOUT]
- User clicks "Sign Out" - No ping received for > 30 minutes
- POST /api/session/logout - Background cleanup / admin query computes:
- Server sets:             sessionDurationSeconds = (lastActivityAt - loginAt)
  logoutAt = now           logoutAt = lastActivityAt
  sessionDurationSeconds   Session marked closed
```

### Endpoints:
- `POST /api/session/ping`: Authenticated heartbeat; debounced/rate-limited; updates `lastActivityAt`.
- `POST /api/session/logout`: Closes active session; updates `logoutAt` and duration.
- `GET /api/admin/activity`: Protected (Admin only); fetches overall metrics, per-user summary table, and latest 50 sessions timeline.

---

## 7. Public Landing Page Routing Architecture (`/`)

- `src/app/page.tsx` is an unauthenticated Server Component.
- On incoming request, check `getServerSession(authOptions)`:
  - **Authenticated:** Call `redirect("/dashboard")` immediately with zero client flicker.
  - **Unauthenticated:** Render the full SaaS marketing landing page (Hero, Feature Grid, Trust Strip, How It Works, Analytics Preview, Target Audience, Pricing, Contact Modal, Footer).
- Links to `/login` for candidates ready to sign in.

---

## 8. Environment Configuration

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