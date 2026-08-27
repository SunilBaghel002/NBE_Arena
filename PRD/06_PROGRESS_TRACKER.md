# PROGRESS TRACKER.md
## NBE Arena — Staged Delivery Plan

> **Philosophy:** Ship a usable mock test flow ASAP. Extraction can be improved iteratively.
> Each stage must leave the app in a runnable state.

---

## Stage Overview

| Stage | Name | Goal | Est. Time |
|-------|------|------|-----------|
| **0** | Bootstrap | Empty Next.js app runs | 30–45 min |
| **1** | Foundation + Manual Bank | Test UI works with seed questions | 3–4 hrs |
| **2** | Vision LLM Pipeline | PDFs become questions automatically | 3–5 hrs |
| **3** | Mock Engine + Results | Full NBE simulation loop complete | 2–3 hrs |
| **4** | Polish + Hardening | 6–10 solid mocks ready for candidate | 1–2 hrs |

---

## STAGE 0 — Bootstrap
**Status:** `[x] Done`

### Tasks
- [x] Create Next.js 14 TS app (`nbe-arena`)
- [x] Install Tailwind, shadcn/ui, zod, zustand, lucide-react
- [x] Setup folder structure per Architecture.md
- [x] Add `.env.local.example`
- [x] Add README with run instructions
- [x] Verify `npm run dev` works

### Exit Criteria
- Blank app loads at localhost:3000

---

## STAGE 1 — Foundation + Manual Question Bank + Test UI
**Status:** `[x] Done`

> **Why first?** Even before OCR works, candidate can practice if we seed 200 questions manually / via simple JSON.

### Tasks
- [x] Define TypeScript types (`Question`, `MockTest`, `Attempt`)
- [x] Create `data/seed-questions.json` with at least:
  - 50 Reasoning
  - 50 GA
  - 50 Quant
  - 50 English
- [x] Build DB layer (JSON read/write local-first)
- [x] API: `GET /api/bank-stats`
- [x] API: `POST /api/generate-mock`
- [x] API: `GET /api/mock/[mockId]` (hide correctOption)
- [x] API: `POST /api/submit`
- [x] API: `GET /api/results/[attemptId]`
- [x] Zustand `testStore`
- [x] UI: Lobby page
- [x] UI: Live Test page (timer, palette, sections, navigation)
- [x] UI: Submit confirmation modal
- [x] UI: Results page (score, section breakdown, wrong answers)
- [x] localStorage persistence for in-progress attempt
- [x] Auto-submit on timer = 0

### Exit Criteria
- [x] Can generate a 200-question mock from seed bank
- [x] Can attempt full test with 180-min timer
- [x] Can submit and see score out of 200
- [x] Section scores show correctly
- [x] Refresh mid-test does not wipe answers
- [x] Scoring uses -0.25 correctly

### Demo Script
1. Open `/`
2. Click Generate Mock
3. Start Test
4. Answer 10 questions across sections
5. Submit
6. Verify results math

---

## STAGE 2 — Vision LLM PDF Extraction Pipeline
**Status:** `[ ] Not Started | [ ] In Progress | [ ] Done`

> **Core AI Stage.** This unlocks unlimited mocks.

### Tasks
- [ ] Implement `pdf-to-images` utility
- [ ] Implement `vision-extract.ts` with provider switch (OpenAI first)
- [ ] Put extraction prompts in `src/lib/prompts.ts`
- [ ] Implement JSON schema validation for LLM output
- [ ] Implement section classifier fallback
- [ ] Implement dedupe by hash
- [ ] API: `POST /api/upload`
- [ ] API: `POST /api/extract` with per-page progress support
- [ ] Admin UI: drag-drop uploader
- [ ] Admin UI: extraction progress list
- [ ] Admin UI: bank stats refresh after extract
- [ ] Handle `correctOption: null` safely
- [ ] Soft-filter advanced Quant (optional flag)
- [ ] Logging of raw LLM page outputs to `data/logs/`
- [ ] `.gitignore` uploads/logs/secrets

### Exit Criteria
- [ ] Upload 1 real SSC CHSL PDF
- [ ] Extract ≥ 40 usable questions automatically
- [ ] Questions appear under correct sections (≥ 70% accuracy)
- [ ] Second PDF increases bank without crashing
- [ ] Duplicates mostly skipped
- [ ] Generate mock still works with mixed seed+extracted questions

### Known Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| LLM garbles math | Prompt for plain text fractions; manual spot check |
| Non-verbal image Qs | hasImage=true; exclude from auto-score if no image stored |
| Rate limits | Sequential pages + retry |
| Cost | Start with 5-page debug mode |

### Demo Script
1. Go `/admin`
2. Upload `SSC_CHSL_2023_Shift1.pdf`
3. Click Extract
4. Watch page progress
5. Confirm bank stats increased
6. Generate new mock successfully

---

## STAGE 3 — Full Mock Engine Quality + Candidate Readiness
**Status:** `[ ] Not Started | [ ] In Progress | [ ] Done`

### Tasks
- [ ] Enforce 50-per-section hard gate
- [ ] Avoid over-reuse of same questions across consecutive mocks (light memory)
- [ ] Results: show target 150 benchmark clearly
- [ ] Results: time per section estimate (if tracked)
- [ ] Review full paper mode after submit
- [ ] Lobby shows list of past attempts + scores
- [ ] Add 5–10 source PDFs to bank (CHSL + MTS + DSSSB)
- [ ] Ensure at least **6 unique mocks** can be generated
- [ ] Add keyboard shortcuts (optional but useful)
- [ ] Empty states & error toasts polished

### Exit Criteria
- [ ] Bank has ≥ 50 active questions in EACH section (ideally ≥ 100)
- [ ] 6 mocks generated and openable
- [ ] Candidate can complete one full 180-min simulation without developer help
- [ ] Wrong-answer review is readable
- [ ] No critical bugs in timer/submit/score

### Candidate Handoff Checklist
- [ ] README: how to start server
- [ ] README: how to upload more PDFs
- [ ] README: exam strategy note (150 target, section order suggestion)
- [ ] Seed/env documented
- [ ] One-click `npm run dev` works on her machine

---

## STAGE 4 — Polish + Hardening (Optional Same Day)
**Status:** `[ ] Not Started | [ ] In Progress | [ ] Done`

### Tasks
- [ ] Answer-key page parser (if time)
- [ ] Store and display diagram images for hasImage questions
- [ ] Export attempt report as PDF
- [ ] Dark mode (optional)
- [ ] Backup/restore question bank button
- [ ] Basic unit tests for scorer + generator
- [ ] Production build test (`npm run build && npm start`)

### Exit Criteria
- [ ] `npm run build` passes
- [ ] 2 full end-to-end runs on production build
- [ ] Developer can leave candidate unsupervised
Acceptance test includes negative marking calculation check

---

## Daily Execution Plan (If Building in One Day)

### Morning (Stage 0 + 1)
- Bootstrap app
- Seed bank
- Build live test UI + results
- **Milestone:** Manual mock works end-to-end

### Afternoon (Stage 2)
- PDF upload + Vision extraction
- Admin panel
- **Milestone:** Real PYQ PDF feeds the bank

### Evening (Stage 3)
- Load multiple PDFs
- Generate Mock 1–6
- Fix bugs from real attempt
- **Milestone:** Candidate starts Mock #1 tonight

---

## Progress Log (Update During Build)

| Date | Stage | Notes | Blockers |
|------|-------|-------|----------|
| YYYY-MM-DD | 0 | | |
| YYYY-MM-DD | 1 | | |
| YYYY-MM-DD | 2 | | |
| YYYY-MM-DD | 3 | | |

---

## Final Acceptance Test (Must All Pass)

1. [ ] Fresh clone/install runs with documented env
2. [ ] Upload PDF → questions extracted into 4 sections
3. [ ] Generate mock → exactly 200 questions (50×4)
4. [ ] Timer starts at 03:00:00 and auto-submits at 0
5. [ ] Palette states work (answered/marked/not visited)
6. [ ] Section switching works without losing answers
7. [ ] Submit calculates score correctly vs correctOption
8. [ ] Results show section breakdown + 150 target status
9. [ ] At least 6 mocks can be created from bank
10. [ ] Candidate completes one full mock without developer intervention

---

## Post-Launch Support Notes

- If extraction quality weak on a PDF: re-run failed pages only
- If Quant too hard: mark geometry tags inactive
- If bank low on GA: prioritize DSSSB + CHSL GA papers
- Keep adding PDFs nightly; bank compounds fast

---

## One-Sentence Mission

**Build a local-first web app that turns SSC/DSSSB PYQ PDFs into unlimited authentic 200-question / 180-minute NBE Junior Assistant mock tests with real CBT UI and scoring analytics — fast enough that the candidate can start practicing the same day.**