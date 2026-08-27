# NBE Arena — NBEMS Junior Assistant CBT Platform

A local-first Computer-Based Test (CBT) platform engineered to simulate the **National Board of Examinations in Medical Sciences (NBEMS) Junior Assistant** examination.

---

## 🎯 Exam Specifications (Source of Truth)
- **Total Questions:** 200 MCQs
- **Total Time:** 180 Minutes (3 Hours)
- **Sections:**
  1. General Intelligence & Reasoning (50 Questions)
  2. General Awareness (50 Questions)
  3. Quantitative Aptitude (50 Questions, Arithmetic focus)
  4. English Comprehension (50 Questions)
- **Marking Scheme:**
  - `+1.00` for Correct Answer
  - `-0.25` for Wrong Answer (Negative Marking)
  - `0.00` for Unanswered
  - **Net Formula:** `Net Score = Correct - (Wrong * 0.25)`
- **Target Qualifying Benchmark:** `150 / 200` (75% Net)

---

## 🛠️ Tech Stack
- **Framework:** Next.js 14 (App Router) + React 18 + TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + Custom CBT Color System
- **State Management:** Zustand + LocalStorage Persistence
- **Validation:** Zod Schemas
- **Icons:** Lucide React
- **Storage:** Local-first JSON Database / SQLite
- **AI Extraction Pipeline:** Vision LLM (OpenAI GPT-4o / Anthropic / Google Gemini)

---

## 🚀 Quickstart Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```
Add your Vision API key (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GOOGLE_API_KEY`) when running Stage 2 PDF extraction.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Repository Structure
```
nbe-arena/
├── PRD/                 # Product requirements and architecture specifications
├── data/
│   ├── pyq/             # Source PDFs (CHSL, MTS, NBE)
│   ├── syllabus/        # Official syllabus references
│   └── reference/       # Pattern reference
├── src/
│   ├── app/             # Next.js App Router (Lobby, Test UI, Results, Admin)
│   ├── components/      # UI components (Palette, Timer, ScoreCard, Uploader)
│   ├── lib/             # Mock generator, scoring, vision extraction, DB
│   ├── store/           # Zustand test state store
│   └── types/           # Shared TypeScript type definitions
```
