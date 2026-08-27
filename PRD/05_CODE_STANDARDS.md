# CODE STANDARDS.md
## NBE Arena — Engineering Conventions

---

## 1. Language & Framework

- TypeScript **strict** mode required across all files
- Next.js 14 App Router (`src/app`)
- React Server Components by default; `'use client'` only where interactive hooks/stores are required
- ESLint + Prettier rules

---

## 2. Naming Conventions

| Type | Rule | Example |
|------|------|---------|
| Components | PascalCase | `QuestionPalette.tsx` |
| Hooks | camelCase with `use` | `useTestStore.ts` |
| Lib / Utilities | camelCase | `calculateAttemptScore()` |
| Types / Interfaces | PascalCase | `interface Attempt` |
| Mongoose Models | PascalCase | `User.ts`, `Question.ts` |
| Constants | UPPER_SNAKE | `TOTAL_EXAM_SECONDS` |
| API routes | kebab folders | `/api/generate-mock/route.ts` |
| Env vars | UPPER_SNAKE | `OPENROUTER_API_KEY`, `VISION_PROVIDER` |

---

## 3. AI Extraction & Provider Engineering Standards

1. **Zero Hardcoded Model Names:**
   - Never embed model strings in extraction code.
   - Always resolve models dynamically via `process.env.OPENROUTER_VISION_MODEL || "qwen/qwen-2.5-vl-7b-instruct"`, `process.env.GEMINI_VISION_MODEL`, etc.
2. **Provider Adapter Pattern:**
   - All vision models implement a common interface `IVisionProvider` (`extractPageFromImage(base64Image): Promise<ExtractedQuestion[]>`).
   - All text models implement `ITextProvider` (`extractPageFromText(rawText): Promise<ExtractedQuestion[]>`).
   - `src/lib/pdf-pipeline.ts` acts as the single orchestrator switching providers via `process.env.VISION_PROVIDER` and `process.env.TEXT_PROVIDER`.
3. **Deterministic Output (`temperature = 0`):**
   - All extraction prompts must pass `temperature: 0` (or the lowest provider equivalent) to eliminate hallucinations and formatting divergence.
4. **Strict JSON Parsing & Retry:**
   - Always strip enclosing markdown code fences (```json ... ```) prior to `JSON.parse()`.
   - On parse failure, perform **exactly one retry** with a targeted correction prompt.
5. **Telemetry & Latency Logging:**
   - Log extraction timing, provider, model name, status, and questions extracted to `data/logs/extraction_telemetry.json` for visibility.
6. **Explicit Token Budgeting (`max_tokens`):**
   - Always supply `max_tokens` in LLM requests to prevent credit exhaustion.

---

## 4. Database Architecture (MongoDB Atlas & Mongoose)

- Use Mongoose singleton connection helper in `src/lib/mongodb.ts` to prevent multiple connection pools during Next.js hot-reloads and serverless lambdas.
- Define models in `src/models/` using standard Mongoose schemas.
- Ensure lean queries (`.lean()`) for high-throughput read operations.
- Primary models:
  - `User`: `username`, `passwordHash`, `name`, `role: "admin" | "student"`
  - `Question`: `id`, `section`, `questionText`, `options`, `correctOption`, `explanation`, `isActive`
  - `MockTest`: `id`, `title`, `timeLimitMinutes`, `sections`, `totalQuestions`
  - `Attempt`: `id`, `userId`, `mockId`, `startedAt`, `submittedAt`, `timeTakenSeconds`, `answers`, `score`

---

## 5. Authentication Standards (NextAuth.js)

- NextAuth Credentials Provider configured in `src/lib/auth.ts` / `src/app/api/auth/[...nextauth]/route.ts`.
- Passwords hashed using `bcryptjs` (minimum 10 salt rounds).
- JWT session strategy with `id`, `username`, `name`, and `role` embedded in the token and session object.
- Protected route checks via server-side session lookup `getServerSession(authOptions)` or middleware.
- Admin protection: `/admin` endpoints and pages require `session.user.role === "admin"`.

---

## 6. Environment Variables

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nbe_arena?retryWrites=true&w=majority
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/nbe_arena?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_32_character_jwt_secret_key

# Vision VLM Provider (Path B - Images)
VISION_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_VISION_MODEL=qwen/qwen-2.5-vl-7b-instruct
OPENROUTER_FALLBACK_MODEL=openai/gpt-4o-mini

GEMINI_API_KEY=AIzaSy...
GEMINI_VISION_MODEL=gemini-2.0-flash

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_VISION_MODEL=qwen2.5-vl:7b

# Text LLM Provider (Path A - Text Pages Only)
TEXT_PROVIDER=groq
GROQ_API_KEY=gsk_...
GROQ_TEXT_MODEL=llama-3.3-70b-versatile
```

---

## 7. API Route Standards & Zod Validation

```typescript
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = SubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const result = await processSubmission(parsed.data, session.user.id);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown server error" },
      { status: 500 }
    );
  }
}
```

---

## 8. Definition of Clean Code

A stage/PR is clean when:
1. TypeScript compiles with zero errors (`npm run build`).
2. MongoDB connection handles disconnects/reconnects cleanly.
3. NextAuth sessions persist across tabs and protect `/admin` securely.
4. Pre-exam instructions gate ensures the 180-min timer only begins after explicit user confirmation.
5. Exact negative marking calculation (`-0.25`) verified by automated test assertions.
6. Extraction pipeline gracefully handles provider fallback and rate limit degradation.
