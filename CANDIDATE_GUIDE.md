# 🏛️ NBE Arena — Candidate & Administrator Guide
**NBEMS Junior Assistant Computer Based Test (CBT) Simulation Platform**

---

## 📌 1. Quick Access & Roles

| Role | Default Username | Default Password | Capabilities |
|---|---|---|---|
| **Admin** | `sunil` / `admin` | `nbe2026` / `admin123` | Take mocks, generate tests, manage candidate passwords, view candidate progress, ingest PYQs |
| **Candidate 1** | `karishma` | `karishma123` | Take mocks, view personal scorecard & attempt history, review 200-question papers |
| **Candidate 2** | `prachii` | `prachii123` | Take mocks, view personal scorecard & attempt history, review 200-question papers |

> 💡 *Note: The Admin can edit any candidate's username or password at any time from the **Admin Panel $\to$ Credentials Editor** tab.*

---

## 🎯 2. Examination Structure & Rules

* **Total Questions:** **200 Questions**
* **Total Duration:** **180 Minutes (3.0 Hours)**
* **Target Qualifying Score:** **150+ / 200 Net Marks (75%)**
* **Negative Marking Scheme:**
  * `+1.00 Mark` for every correct option.
  * `-0.25 Mark` penalty for every wrong option.
  * `0.00 Marks` for skipped/unanswered questions.

### Section Breakdown (50 Questions Each):
1. **General Intelligence & Reasoning** — 50 Qs — 50 Marks
2. **General Awareness** — 50 Qs — 50 Marks
3. **Quantitative Aptitude** (Arithmetic Focus) — 50 Qs — 50 Marks
4. **English Comprehension** — 50 Qs — 50 Marks

---

## 💻 3. Candidate Walkthrough

### Step 1: Login (`/login`)
1. Open the portal URL (e.g. `http://localhost:3000` or your Vercel deployment URL).
2. Enter your assigned username and password.

### Step 2: Candidate Dashboard (`/`)
* View your **Average Net Score**, **Personal Best Score**, **Accuracy %**, and **Tests Completed**.
* Review your **Net Score Trajectory chart** and **Sectional Mastery cards**.
* Click **"Start Mock"** on any available mock test paper (or click **"Generate New Mock Test"**).

### Step 3: Pre-Exam Instructions (`/test/[mockId]/instructions`)
* Review the official rules, marking scheme, and CBT shortcuts.
* Check the mandatory declaration checkbox: *"I have read and understood all instructions."*
* Click **"Begin Test"** to enter the exam hall and begin the 180-minute countdown.

### Step 4: Live CBT Exam Hall (`/test/[mockId]`)
* **Fullscreen Exam Mode:** Click the fullscreen icon in the top header for distraction-free testing.
* **Auto-Persistence:** Your chosen options and timer are continuously auto-saved. If you accidentally refresh or close the tab, you can resume seamlessly.
* **Keyboard Shortcuts:**
  * `1`, `2`, `3`, `4`: Select option A, B, C, D
  * `N`: Save & Next question
  * `P`: Previous question
  * `M`: Mark for Review
  * `C`: Clear selected answer
* **Palette Navigation:** The 50-question palette grid shows:
  * 🟢 **Green:** Answered
  * 🔴 **Red:** Not Answered
  * 🟣 **Purple:** Marked for Review
  * ⚪ **Gray:** Not Visited

### Step 5: Scorecard & 200-Question Review (`/results/[attemptId]`)
* Immediate calculation of **Net Score / 200**, **Negative Penalties**, and **Qualifying Benchmark Badge** ($\ge 150$).
* **Section-wise Penalty Breakdown:** Detailed analysis of correct vs wrong in all 4 sections.
* **Full Paper Review:**
  * Filter by **Section** (*All, Reasoning, GA, Quant, English*).
  * Filter by **Status** (*All, Wrong, Correct, Skipped*).
  * Use the **200-Question Quick-Jump Palette** to jump straight to any question.
  * Compare **"Your Choice"** vs official **"Correct Key"** with step-by-step explanations.

---

## ⚙️ 4. Administrator Features (`/admin`)

* **Candidate Progress:** Track test count, average score, and attempt logs for Karishma, Prachii, and other candidates.
* **Credentials Editor:** Reset passwords or add new candidate profiles in one click.
* **Question Bank Repository:** Real-time counter of active questions in MongoDB Atlas.
* **AI PDF Ingestion:** Upload or select PYQ PDFs to auto-extract and expand the question bank.

---

## 🚀 5. Deployment on Vercel

When deploying to Vercel, configure the following Environment Variables in your Vercel Project Settings:
1. `MONGODB_URI`: Your MongoDB Atlas connection string (including `/nbe_arena`).
2. `NEXTAUTH_URL`: Your Vercel production URL (e.g. `https://nbe-arena.vercel.app`).
3. `NEXTAUTH_SECRET`: A 32+ character random secret string.
4. `OPENROUTER_API_KEY`: Your OpenRouter API key.
5. `GROQ_API_KEY`: Your Groq API key.
6. `GEMINI_API_KEY`: Your Google Gemini API key.
