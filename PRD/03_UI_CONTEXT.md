# UI CONTEXT.md
## NBE Arena — UI/UX Specification

---

## 1. Design Principles

1. **Exam-first:** UI must feel like a real CBT (Computer Based Test) hall interface
2. **Zero distraction:** No animations that waste time; no marketing fluff during test
3. **One-glance status:** Timer, question number, section always visible
4. **Desktop primary:** Optimize for 1366×768 and 1920×1080
5. **Color meanings fixed:**
   - Green = Answered
   - Red / Orange = Not answered
   - Purple = Marked for review
   - Grey = Not visited
   - Blue = Current question

---

## 2. Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| primary | `#1A5276` | Headers, primary buttons |
| saffron | `#E67E22` | Accents, warnings |
| success | `#27AE60` | Answered, correct |
| danger | `#C0392B` | Timer low, wrong, unmet target |
| purple | `#8E44AD` | Marked for review |
| bg | `#F4F6F7` | Page background |
| card | `#FFFFFF` | Cards, panels |
| text | `#1C2833` | Body text |
| muted | `#7F8C8D` | Secondary text |

---

## 3. Screens

### 3.1 Home / Lobby (`/`)

**Purpose:** Entry point. Start a mock or go to admin.

**Layout:**
┌────────────────────────────────────────────┐
│ NBE ARENA [Admin] [Bank Stats] │
├────────────────────────────────────────────┤
│ │
│ 🎯 NBE Junior Assistant Mock Tests │
│ 200 Questions · 180 Minutes · 150 Target│
│ │
│ ┌──────────────────────────────┐ │
│ │ Generate New Mock Test │ │
│ └──────────────────────────────┘ │
│ │
│ Previous Mocks │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ Mock #1 │ │ Mock #2 │ │ Mock #3 │ │
│ │ Start │ │ Start │ │ Resume │ │
│ └─────────┘ └─────────┘ └─────────┘ │
│ │
│ Bank: Reasoning 120 | GA 95 | │
│ Quant 110 | English 130 │
└────────────────────────────────────────────┘

text


**Rules:**
- Disable "Generate" if any section has < 50 questions
- Show tooltip: "Need at least 50 questions per section"

---

### 3.2 Admin Panel (`/admin`)

**Purpose:** Upload PDFs, run extraction, monitor bank.

**Sections:**
1. **Upload Zone** — drag-drop PDF, accept multiple
2. **Extraction Queue** — list of uploaded PDFs with status:
   - `pending` | `processing page X/Y` | `done` | `failed`
3. **Bank Stats Cards** — 4 cards (one per section) with counts
4. **Source List** — which exams contributed how many Qs
5. **Danger Zone** — clear bank (with confirm)

**Extraction Progress UI:**
Extracting SSC_CHSL_2023.pdf
████████░░ 8/12 pages
Found: 28 questions (R:8 GA:6 Q:7 E:7)

text


---

### 3.3 Live Test UI (`/test/[mockId]`) — MOST IMPORTANT SCREEN

**Layout (CSS Grid):**
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Logo | Section Tabs | Timer 02:59:12 | Submit Btn │
├──────────────────────────────┬──────────────────────────────┤
│ │ QUESTION PALETTE │
│ SECTION: Reasoning (12/50) │ R GA Q E (mini tabs) │
│ │ ┌──┬──┬──┬──┬──┐ │
│ Q.12 │ │1 │2 │3 │4 │5 │ │
│ If A is brother of B... │ │6 │7 │8 │9 │10│ │
│ │ ... │
│ (A) Option text │ Legend: ■ Ans ■ Mark ... │
│ (B) Option text │ │
│ (C) Option text │ ┌────────────────────┐ │
│ (D) Option text │ │ Summary │ │
│ │ │ Answered: 40 │ │
│ │ │ Marked: 5 │ │
│ │ │ Left: 155 │ │
│ │ └────────────────────┘ │
├──────────────────────────────┴──────────────────────────────┤
│ FOOTER: [← Prev] [Clear] [Mark Review] [Save & Next →] │
└─────────────────────────────────────────────────────────────┘

text


**Header Rules:**
- Timer turns ORANGE at 30 min left, RED at 10 min left
- Timer blinks at 5 min left
- Section tabs show badge count of answered in that section
- Submit opens confirmation modal: "You have X unanswered. Submit anyway?"

**Palette Rules:**
- Clicking number jumps to that question
- 5 columns of numbers per section
- Current question has blue ring

**Question Card Rules:**
- Radio buttons for options (single select)
- Support multiline question text
- If `hasImage`, show placeholder: "Image question — refer original" OR show stored image
- Math text rendered as plain readable text (no broken symbols)

**Keyboard Shortcuts (nice-to-have):**
- `1/2/3/4` → select option A/B/C/D
- `n` → next
- `p` → prev
- `m` → mark for review

**Auto-save:**
- Persist answers to localStorage every change
- On refresh, restore attempt state

---

### 3.4 Submit Confirmation Modal
┌─────────────────────────────────────┐
│ Submit Test? │
│ │
│ Answered: 162 │
│ Marked for Review: 12 │
│ Not Answered: 26 │
│ │
│ Time Remaining: 00:24:10 │
│ │
│ [Cancel] [Confirm Submit]│
└─────────────────────────────────────┘

text


---

### 3.5 Results Screen (`/results/[attemptId]`)

**Top Score Hero:**
┌────────────────────────────────────────────┐
│ YOUR SCORE │
│ 153 / 200 │
│ ✅ QUALIFYING MARK CLEARED │
│ (Target: 150) │
│ Time Taken: 2h 41m │
└────────────────────────────────────────────┘

text


If score < 150 → show red "Below Target — Keep Practicing"

**Section Breakdown (4 cards or bar chart):**
| Section | Score | Accuracy | Time |
|---------|-------|----------|------|
| Reasoning | 41/50 | 82% | 48 min |
| GA | 36/50 | 72% | 28 min |
| Quant | 35/50 | 70% | 52 min |
| English | 41/50 | 82% | 33 min |

**Wrong Answers Review:**
- Expandable list
- Shows: Question, Your Answer (red), Correct Answer (green), optional explanation
- Results screen must show negative marking breakdown

**Actions:**
- [Review Full Paper]
- [Go to Lobby]
- [Generate Another Mock]

---

## 4. Empty / Error States

| State | UI |
|-------|----|
| Bank empty | "Upload PYQ PDFs from Admin to build your question bank" |
| Section < 50 Qs | "Need 12 more Reasoning questions to generate a mock" |
| Extraction fail | "Page 4 failed — retry or skip" |
| LLM key missing | "Add OPENAI_API_KEY to .env.local" |
| Mid-test refresh | Auto-restore from localStorage |
| Timer hit zero | Force submit + toast "Time up! Auto-submitted" |

---

## 5. Typography

- Headings: Inter / system-ui Bold
- Body: Inter / system-ui Regular
- Timer: Monospace (tabular nums) — `font-variant-numeric: tabular-nums`
- Question text: 16–18px, line-height 1.6
- Options: 15–16px

---

## 6. Accessibility Basics

- All buttons focusable
- Radio groups with proper labels
- Timer has `aria-live="polite"`
- Palette buttons have aria-label "Question 12, answered"
- Confirm modals trap focus

---

## 7. Responsive Note

- Below 1024px width: stack palette below question (still usable on small laptops)
- Do NOT optimize for mobile phones — exam is desktop CBT