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
| Env vars | UPPER_SNAKE | `MONGODB_URI`, `NEXTAUTH_SECRET` |

---

## 3. Database Architecture (MongoDB Atlas & Mongoose)

- Use Mongoose singleton connection helper in `src/lib/mongodb.ts` to prevent multiple connection pools during Next.js hot-reloads and serverless lambdas.
- Define models in `src/models/` using standard Mongoose schemas.
- Ensure lean queries (`.lean()`) for high-throughput read operations.
- Primary models:
  - `User`: `username`, `passwordHash`, `name`, `role: "admin" | "student"`
  - `Question`: `id`, `section`, `questionText`, `options`, `correctOption`, `explanation`, `isActive`
  - `MockTest`: `id`, `title`, `timeLimitMinutes`, `sections`, `totalQuestions`
  - `Attempt`: `id`, `userId`, `mockId`, `startedAt`, `submittedAt`, `timeTakenSeconds`, `answers`, `score`

---

## 4. Authentication Standards (NextAuth.js)

- NextAuth Credentials Provider configured in `src/lib/auth.ts` / `src/app/api/auth/[...nextauth]/route.ts`.
- Passwords hashed using `bcryptjs` (minimum 10 salt rounds).
- JWT session strategy with `id`, `username`, `name`, and `role` embedded in the token and session object.
- Protected route checks via server-side session lookup `getServerSession(authOptions)` or middleware.
- Admin protection: `/admin` endpoints and pages require `session.user.role === "admin"`.

---

## 5. Environment Variables

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nbe_arena?retryWrites=true&w=majority
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/nbe_arena?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_32_character_jwt_secret_key

# Vision LLM Extraction Keys
VISION_PROVIDER=openai
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
```

---

## 6. API Route Standards & Zod Validation

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

## 7. UI Standards & Accessibility

- Authentic CBT design using dedicated Tailwind color tokens (`exam-primary`, `exam-saffron`, `exam-answered`, `exam-unanswered`, `exam-marked`).
- Monospace tabular numbers (`font-tabular`) on all timers and count badges.
- Accessible ARIA labels on palette numbers (`aria-label="Question 14, answered"`).
- Buttons show loading spinners (`Loader2`) and are disabled during asynchronous mutations.

---

## 8. Definition of Clean Code

A stage/PR is clean when:
1. TypeScript compiles with zero errors (`npm run build`).
2. MongoDB connection handles disconnects/reconnects cleanly.
3. NextAuth sessions persist across tabs and protect `/admin` securely.
4. Pre-exam instructions gate ensures the 180-min timer only begins after explicit user confirmation.
5. Exact negative marking calculation (`-0.25`) verified by automated test assertions.
