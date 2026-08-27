# UI CONTEXT.md
## NBE Arena — UI/UX Specification

---

## 1. Design Principles

1. **Exam-first:** UI must feel like an authentic CBT (Computer Based Test) examination hall portal.
2. **Pre-Exam Clarity:** Candidate must review and explicitly acknowledge exam rules before the timer commences.
3. **Personalized Progress:** Each candidate has an isolated dashboard tracking their historical attempts, score progression, and accuracy.
4. **Zero distraction:** Clean CBT layout without extraneous animations or marketing distractions during active tests.
5. **Desktop primary:** Optimized for laptop and desktop screens (1366×768 and 1920×1080).
6. **Fixed Semantic CBT Palette:**
   - **Green (`#27AE60`):** Answered
   - **Red / Orange (`#E74C3C`):** Not Answered
   - **Purple (`#8E44AD`):** Marked for Review
   - **Purple with Dot (`#6C3483`):** Answered & Marked for Review
   - **Grey (`#BDC3C7` / `#E2E8F0`):** Not Visited
   - **Blue (`#2980B9`):** Current Active Question

---

## 2. Color Palette & Typography

| Token | Hex | Usage |
|-------|-----|-------|
| primary | `#1A5276` | CBT Headers, primary CTA buttons |
| primaryHover | `#154360` | Hover states |
| saffron | `#E67E22` | NBE branding badge, warnings |
| success | `#27AE60` | Answered questions, qualifying cleared |
| danger | `#C0392B` | Unanswered, timer alert, negative score |
| purple | `#8E44AD` | Marked for review |
| bg | `#F4F6F7` | Background workspace |
| card | `#FFFFFF` | Panels and question cards |
| text | `#1C2833` | Body text |
| muted | `#7F8C8D` | Secondary subtitles |

- Timer & Numbers: Monospace tabular numerals (`font-tabular`) to eliminate jitter.
- Question & Option Text: 16–18px font size with 1.6 line height for effortless readability.

---

## 3. Screen Specifications

### 3.1 Login Screen (`/login`)
- **Purpose:** Secure entry point for candidates.
- **Form:** Username, Password, Sign In button.
- **Validation:** Clear error toast on invalid credentials.
- **Redirect:** On success, routes to the Student Dashboard (`/`).

---

### 3.2 Student Dashboard / Personalized Lobby (`/`)
- **Purpose:** Primary candidate hub.
- **Header:** Candidate display name, Role badge (`Admin` or `Student`), Logout button. If `admin`, show link to `/admin`.
- **Hero Banner:** "NBE Junior Assistant Mock Test Series" (200 Questions · 180 Minutes · 150 Target).
- **Candidate Performance Summary Cards:**
  - Total Mocks Completed
  - Average Net Score (with 150 benchmark comparison)
  - Overall Accuracy %
  - Best Score
- **Action Button:** "Generate New Mock Test" (triggers mock generator).
- **Available Mock Tests List:** Cards for generated mocks with **"Start Mock"** button (which navigates to the Pre-Exam Instructions page).
- **Personal Attempt History:** Table/List of user's past attempts with Net Score / 200, Date, Time Taken, and "View Scorecard" link.

---

### 3.3 Pre-Exam Rules / Instructions Screen (`/test/[mockId]/instructions`) — MANDATORY STEP
- **Purpose:** Ensure candidate reads official rules before the countdown timer begins.
- **Exam Summary Header:**
  - Mock Title (e.g. *NBE Junior Assistant Full Mock #2*)
  - Total Questions: **200 Questions**
  - Total Duration: **180 Minutes (3.0 Hours)**
  - Total Marks: **200 Marks**
- **Section Breakdown Table:**
  1. General Intelligence & Reasoning — 50 Qs — 50 Marks
  2. General Awareness — 50 Qs — 50 Marks
  3. Quantitative Aptitude — 50 Qs — 50 Marks (Arithmetic focus)
  4. English Comprehension — 50 Qs — 50 Marks
- **Marking Scheme Details:**
  - `+1.00` for each correct response.
  - `-0.25` penalty for each wrong response (Negative marking).
  - `0.00` for unanswered or skipped questions.
  - Target qualifying benchmark: **150+ / 200 Net Marks**.
- **CBT Navigation Guidelines:**
  - Green = Answered, Red = Not Answered, Purple = Marked for Review, Grey = Not Visited.
  - Keyboard shortcuts: `1, 2, 3, 4` for options, `N` for Next, `P` for Previous, `M` for Mark.
- **Mandatory Declaration Checkbox:**
  - `[ ]` *"I have read and understood all instructions. I declare that I am ready to start the examination."*
- **Action Button:**
  - **"Begin Test"** button (Disabled by default; unlocks ONLY when the declaration checkbox is ticked).
  - Clicking "Begin Test" launches `/test/[mockId]` and STARTS the 180-minute countdown timer.

---

### 3.4 Live CBT Test Interface (`/test/[mockId]`)
- **Timer:** 180-minute global countdown (`03:00:00`). Alerts: Orange at $\le 30$ mins, Red at $\le 10$ mins, Flashing at $\le 5$ mins.
- **Section Tabs:** Reasoning, GA, Quant, English with dynamic badges showing answered counts (`X/50`).
- **Question Area:**
  - Question Number, Section Name, `+1.00` / `-0.25` badge.
  - Question text & diagrams.
  - 4 Single-select radio options (A, B, C, D) with keyboard key hints.
  - Footer actions: `← Previous`, `Clear`, `Mark for Review`, `Save & Next →`.
- **Question Palette (Right / Sticky):**
  - 5-column grid of buttons (1 to 50 for active section) reflecting real-time CBT color status.
  - Status Summary counter (Answered, Not Answered, Marked, Not Visited).
- **Auto-Persistence:** All answer choices and elapsed seconds saved to `localStorage` immediately. Mid-test refresh seamlessly restores the candidate's exact state.
- **Auto-Submit:** Triggers automatically when countdown reaches `00:00:00`.

---

### 3.5 Submit Confirmation Modal
- Pops up when candidate clicks "Submit Test" or when time expires.
- Summarizes: Answered Count, Marked Count, Unanswered Count, Time Remaining.
- Buttons: `Resume Test` and `Confirm Submit`.

---

### 3.6 Results & Scorecard Screen (`/results/[attemptId]`)
- **Scorecard Hero:**
  - Net Score / 200 ($\text{Correct} - 0.25 \times \text{Wrong}$).
  - Qualifying Badge: Green "QUALIFYING MARK CLEARED" ($\ge 150$) or Red "BELOW TARGET" ($< 150$).
  - Accuracy %, Time Taken, Total Correct (+1.00), Total Wrong (-0.25), Total Skipped (0).
- **Section-Wise Breakdown:** 4 cards showing section net score, correct, wrong, blank, and time.
- **Question Review List:** Filterable by *All*, *Wrong*, *Correct*, *Skipped*. Displays candidate's choice vs correct option with detailed solution explanations.

---

### 3.7 Admin Panel (`/admin`) — Admin Role Protected
- **Access:** Only authenticated users with `role: "admin"`.
- **Features:** Drag-drop PYQ PDF uploader, extraction queue with per-page progress, question repository statistics, and global mock generation.