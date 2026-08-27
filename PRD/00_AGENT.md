You are my project architect agent for a repo named `nbe_arena`.

Create a file `prd/00_AGENT.md` that will act as the permanent brain/base instruction file for all future coding agents working in this repository.

Read and align with all files in `/prd` and `/data/reference` if present.

The `00_AGENT.md` must include:

1. Mission
- Build a local-first web platform that converts SSC CHSL/MTS/DSSSB/NBE PYQ PDFs into unlimited NBE Junior Assistant mock tests.

2. Exam truth source
- 200 questions
- 180 minutes
- 4 sections x 50
- Marking: +1 correct, -0.25 wrong, 0 unanswered
- Target practice score: 150+ net

3. Non-negotiables
- Follow staged delivery in `06_PROGRESS_TRACKER.md`
- Do not skip stages
- Use Vision LLM extraction (not plain Tesseract-only)
- Keep correct answers hidden until submit
- Implement negative marking exactly
- Local-first, simple for one candidate user

4. Source data locations
- PRDs: /prd
- PYQs: /data/pyq
- Syllabus: /data/syllabus
- Pattern reference: /data/reference/paper_pattern.md

5. Build order
- Stage 0 bootstrap
- Stage 1 seed/mock UI + scoring
- Stage 2 PDF vision extraction
- Stage 3 generate 6+ mocks and harden

6. Coding standards pointer
- Follow `05_CODE_STANDARDS.md`

7. Architecture pointer
- Follow `02_ARCHITECTURE.md`

8. UI pointer
- Follow `03_UI_CONTEXT.md`

9. AI extraction pointer
- Follow `04_AI_WORKFLOW.md`

10. Agent behavior rules
- Before coding, restate the stage goal and exit criteria
- After each stage, run through exit criteria checklist
- Ask before introducing major scope outside PRD
- Prefer working end-to-end vertical slices
- Never claim done unless acceptance checks pass

Output only the full markdown content for `prd/00_AGENT.md`.