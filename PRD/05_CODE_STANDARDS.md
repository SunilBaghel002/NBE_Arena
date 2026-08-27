# CODE STANDARDS.md
## NBE Arena — Engineering Conventions

---

## 1. Language & Framework

- TypeScript **strict** mode required
- Next.js App Router (no Pages Router)
- React Server Components by default; `'use client'` only when needed
- ESLint + Prettier on save

---

## 2. Naming Conventions

| Type | Rule | Example |
|------|------|---------|
| Components | PascalCase | `QuestionPalette.tsx` |
| Hooks | camelCase with `use` | `useTestTimer.ts` |
| Lib functions | camelCase | `generateMock()` |
| Types / Interfaces | PascalCase | `interface Question` |
| Constants | UPPER_SNAKE | `TOTAL_DURATION_SECONDS` |
| API routes | kebab folders | `/api/generate-mock/route.ts` |
| Env vars | UPPER_SNAKE | `OPENAI_API_KEY` |

---

## 3. File Rules

- One component per file
- Keep components under 250 lines; split if larger
- Shared types ONLY in `src/types/index.ts`
- No `any` — use `unknown` + narrow
- Prefer `type` for unions; `interface` for object shapes

---

## 4. Environment Variables

```env
# .env.local
VISION_PROVIDER=openai
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
DATABASE_URL=file:./data/nbe.db
Document all env keys in README.

5. API Route Standard
TypeScript

// pattern
export async function POST(req: Request) {
  try {
    const body = await req.json()
    // validate with zod
    const result = await doWork(body)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
Validate inputs with Zod
Consistent error shape: { error: string, details?: any }
Never return stack traces to client
6. Validation Schemas (Zod)
Must define schemas for:

Uploaded extract request
Question insert
Mock generate
Submit attempt payload
Example:

TypeScript

const SubmitSchema = z.object({
  mockId: z.string().uuid(),
  attemptId: z.string().uuid(),
  timeTakenSeconds: z.number().int().positive(),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedOption: z.enum(["a","b","c","d"]).nullable(),
    status: z.enum(["answered","marked","answered_marked","not_visited","unanswered"])
  }))
})
7. UI Standards
Use shadcn/ui for Button, Card, Dialog, Tabs, Progress, Badge, RadioGroup
Tailwind only — no random CSS files unless global
Timer must use tabular-nums
Disable buttons while loading; show spinner
Toast for success/error (sonner or shadcn toast)
8. State Management
Server data: fetch in server components or React Query
Live test ephemeral state: Zustand
Persist test progress: localStorage key nbe-attempt-{attemptId}
Do not put correct answers in client state until results page
9. Testing Mindset (Lightweight)
Since speed matters, minimum:

Unit test: generateMock returns 50 each section
Unit test: scoring function counts correctly
Unit test: timer clamp at 0
Manual checklist in Progress Tracker for UI flows
10. Git Hygiene
text

.gitignore must include:
node_modules/
.env.local
public/uploads/
data/*.db
data/questions.json
data/logs/
.next/
Commit messages:

feat: ...
fix: ...
chore: ...
docs: ...
11. Accessibility & UX Minimum
Buttons have loading text
Destructive actions need confirm dialog
Form inputs have labels
Focus visible outlines retained
12. Performance Budgets
Test page load with 200 questions: under 2s on localhost
Timer drift < 1s per 10 minutes
Extraction: show per-page progress; never block UI thread without feedback
13. Security Baseline
LLM keys server-only
Sanitize filename on upload
Limit upload size (e.g. 30MB)
Limit pages processed (e.g. 60 pages/PDF)
No eval on LLM output — JSON.parse inside try/catch only
14. Code Comments Policy
Comment why, not what
Document non-obvious exam rules inline
Prompt strings live in dedicated prompts.ts, not buried in route files


#15. Definition of Clean Code for This Repo
A PR/stage is clean when:

TypeScript compiles with zero errors
npm run build succeeds
No unused imports
README explains how to run locally in < 10 steps
One happy-path demo works: upload → extract → generate → attempt → results
