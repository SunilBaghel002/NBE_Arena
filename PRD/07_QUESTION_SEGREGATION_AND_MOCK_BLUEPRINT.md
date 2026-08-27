# NBE Arena: Question Segregation, Extraction Pipeline & Mock Test Blueprint

**Document Version:** 1.0.0  
**Target Examination:** National Board of Examinations in Medical Sciences (NBEMS) — Junior Assistant CBT  
**Pattern:** 200 Questions · 180 Minutes · 4 Sections (50 Qs each) · Marking: +1.00 / −0.25 · Target Benchmark: 150/200  

---

## Executive Summary

During candidate testing on **NBE Mock Test 6**, several critical data integrity and question quality issues were identified:
1. **Cross-Section Bleed:** General Awareness (History, Polity) questions appearing inside the Quantitative Aptitude section; Math questions appearing in English.
2. **Missing Multi-Column Tables:** Match-the-following questions (e.g., Column I States vs. Column II Official Languages) stripped of tabular structure during flat text OCR.
3. **Missing Visuals & Diagrams:** Non-verbal Reasoning (paper folding, mirror images, embedded figures, series patterns) rendered as plain text without the required diagrams.
4. **Topic Skew & Question Repetition:** High frequency of single topics (Blood Relations, Equation interchange) with zero representation for other core syllabus areas (Syllogisms, Directions, Cloze Test, Data Interpretation).
5. **Question Palette Repetition:** Redundant questions appearing in the same 200-question paper due to global pool slicing without topic constraints.

This document provides a **complete root-cause analysis** and a **production-grade engineering blueprint** to cleanly segregate, extract, validate, and assemble authentic 200-question mock tests.

---

## 1. Identified Issues & Root Cause Analysis

```
                               CURRENT EXTRACTION ISSUES
 ┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────┐
 │   1. Section Bleed      │   │   2. Missing Tables     │   │   3. Stripped Visuals   │
 │ GA in Math / Math in GA │   │ Multi-column layout lost│   │ Diagrams dropped in OCR │
 └────────────┬────────────┘   └────────────┬────────────┘   └────────────┬────────────┘
              │                             │                             │
              └──────────────────────┬──────┴─────────────────────────────┘
                                     ▼
                     ┌───────────────────────────────┐
                     │ ROOT CAUSE: Flat Single-Pass  │
                     │ Text Regex without 2-Tier     │
                     │ Classification & Image Engine │
                     └───────────────────────────────┘
```

### Problem 1: Cross-Section Bleeding (GA in Math, Math in English)
* **What Happened:** In SSC/NBE question papers, section headers like `Section : Quantitative Aptitude` or `Section : General Awareness` appear only once every 25–50 questions.
* **Why It Failed:** Flat regex splitters fail when:
  1. Header text is split across page boundaries (e.g., `Section :` on bottom of page 12, `Quantitative Aptitude` on top of page 13).
  2. OCR text streams interleave header lines with watermark text or candidate roll numbers.
  3. The parser defaults to the previously active section for all subsequent questions until the next header is hit.

### Problem 2: Missing Tables & Multi-Column Match Formats
* **What Happened:** Questions stating *"Match the entries in Column I with Column II"* appeared with blank options or jumbled single-line text (e.g., `a-1, b-2, c-3`).
* **Why It Failed:** 
  * PDF text extraction extracts words top-to-bottom, left-to-right across the whole page width.
  * Multi-column tables get flattened into alternating text tokens (`State 1 Language 1 State 2 Language 2`), destroying row-column relationships.

### Problem 3: Stripped Visual / Non-Verbal Diagrams
* **What Happened:** Questions like *"From the given answer figures, select the one in which the question figure is hidden/embedded"* appeared with option labels `A`, `B`, `C`, `D` but no question figure or option figures.
* **Why It Failed:** 
  * PDF text engines (`unpdf`/`pdf-parse`) read only the character text layer.
  * The actual diagrams are raster JPEG/PNG streams or vector XObjects inside the PDF binary tree. Without a dedicated bounding-box image cropper or multimodal vision parser, the visual elements are lost.

### Problem 4: Topic Skew (Blood Relations Over-Representation)
* **What Happened:** Candidates experienced 10–15 Blood Relation questions and multiple equation interchange questions in a single mock test.
* **Why It Failed:** 
  * Bulk extraction inserted questions in chronological order from 35 PDF shifts.
  * When generating a mock test by taking a slice of the pool, questions clustered from the same shift or question template were selected consecutively instead of using a balanced syllabus blueprint.

---

## 2. Target Examination Blueprint (NBE Jr. Assistant)

An authentic mock test must enforce a **strict, balanced syllabus taxonomy** (50 questions per section, 200 total):

| Section | Target Qs | Mandatory Topic Distribution |
| :--- | :---: | :--- |
| **Section I: General Intelligence & Reasoning** | **50** | • Analogies & Classification: 8–10 Qs<br>• Coding-Decoding: 6–8 Qs<br>• Series (Number/Alphabet): 6–8 Qs<br>• Syllogisms & Statements: 4–6 Qs<br>• Blood Relations: 3–4 Qs *(max)*<br>• Direction Sense: 3–4 Qs<br>• Mathematical Operations: 3–4 Qs<br>• Non-Verbal (Mirror, Paper Fold, Embedded, Cubes): 8–10 Qs |
| **Section II: General Awareness** | **50** | • Indian History & Culture: 8–10 Qs<br>• Indian Polity & Constitution: 8–10 Qs<br>• Geography & Environment: 6–8 Qs<br>• General Science (Physics, Chem, Bio): 10–12 Qs<br>• Economy & Banking: 4–6 Qs<br>• Current Affairs & Static GK: 8–10 Qs |
| **Section III: Quantitative Aptitude** | **50** | • Number System & Simplification: 6–8 Qs<br>• Percentage, Profit & Loss: 8–10 Qs<br>• Ratio, Proportion & Averages: 6–8 Qs<br>• Time & Work, Time & Distance: 6–8 Qs<br>• Simple & Compound Interest: 4–5 Qs<br>• Basic Algebra & Mensuration: 6–8 Qs<br>• Data Interpretation (Tables, Bar/Pie Charts): 8–10 Qs |
| **Section IV: English Comprehension** | **50** | • Reading Comprehension Passages: 10–12 Qs<br>• Cloze Test (Fill in blanks): 5–10 Qs<br>• Spotting Errors & Sentence Improvement: 8–10 Qs<br>• Synonyms, Antonyms & One-word Substitutions: 8–10 Qs<br>• Idioms & Phrases: 5–6 Qs<br>• Active/Passive & Direct/Indirect Speech: 4–6 Qs |

---

## 3. The 4-Tier Solution Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          4-TIER SOLUTION PIPELINE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. DETERMINISTIC LOCATOR   → Hard page & 25/50-Q shift bounds map           │
│ 2. VISUAL & TABLE ENGINE   → Auto-crops figure PNGs & formats MD tables     │
│ 3. SECONDARY CLASSIFIER    → Keyword/VLM validator prevents cross-bleed    │
│ 4. BLUEPRINT MOCK ASSEMBLY → Strict 50-Q topic quota sampler                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tier 1: Deterministic Section Boundary Locator
To eliminate cross-section bleeding:
1. **Multi-Pattern Header Recognition:** Match exact regular expressions for TCS/SSC/NBE section markers.
2. **Page-Range Map Construction:** Build a page-to-section index before extracting individual questions (e.g., Pages 1–7 = Reasoning, Pages 8–14 = GA, Pages 15–22 = Quant, Pages 23–30 = English).
3. **Hard Question Index Check:** In standard SSC/NBE 100-question shifts:
   * Q.1 to Q.25 = Reasoning
   * Q.26 to Q.50 = General Awareness
   * Q.51 to Q.75 = Quantitative Aptitude
   * Q.76 to Q.100 = English
   * Any question extracted from Q.26 to Q.50 is **strictly enforced** as `GA`, regardless of text artifacts.

### Tier 2A: Visual & Table Extraction Pipeline (For Diagrams & Match Columns)
1. **Visual/Diagram Cropper:** Render page at 300 DPI, identify diagram bounding boxes, save to `public/uploads/questions/{qId}.png`, and attach `imagePath` in MongoDB.
2. **Table & Match Structuring:** Format 2-column match questions into standard GitHub-flavored Markdown tables.

### Tier 3: Secondary AI Section & Topic Classifier
* Automatically detects vocabulary signatures:
  * Contains `sin`, `cos`, `triangle`, `ratio`, `simple interest`, `x + y` $\to$ **Must be `QUANT`**.
  * Contains `synonym`, `antonym`, `grammatical error`, `passive voice`, `idiom` $\to$ **Must be `ENGLISH`**.
  * Contains `capital of`, `governor`, `dynasty`, `constitution`, `vitamin` $\to$ **Must be `GA`**.
  * Contains `analogy`, `blood relation`, `syllogism`, `mirror`, `coded as` $\to$ **Must be `REASONING`**.
* Misplaced questions (e.g. History in Quant) are automatically moved to their correct section in MongoDB.

### Tier 4: Blueprint-Driven Mock Test Generator
* Replaces naive random slicing with a weighted topic sampler enforcing exact topic limits (e.g., max 3 Blood Relations, 10 Non-Verbal Figures, 8 Data Interpretation questions).

---

## 4. Implementation & Remediation Action Plan

1. **Phase 1 (Section Re-Tagging & Table Structuring):** Run automated classifier to clean existing 1,684 questions and format tables.
2. **Phase 2 (Visual & Diagram Extraction):** Crop PDF figures into `public/uploads/questions/` and link image paths.
3. **Phase 3 (Blueprint Assembly Engine):** Update mock generator with syllabus quotas and regenerate clean Mocks 1 through 6.

---

*Authored for the NBE Arena Core Team. Approved for architectural implementation.*
