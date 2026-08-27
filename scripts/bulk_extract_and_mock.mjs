/**
 * Bulk Extract & Mock Generator
 * 
 * Extracts questions from all PYQ PDFs using local regex parsing (zero API cost),
 * inserts into MongoDB Atlas with SHA-256 deduplication,
 * then generates 6 mock tests (200 questions each, 50 per section).
 * 
 * Usage: node scripts/bulk_extract_and_mock.mjs
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { extractText } from "unpdf";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// ─── Load .env manually ────────────────────────────────────────────────
const envPath = path.join(ROOT, ".env");
const envVars = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8").split("\n").forEach((line) => {
    const t = line.trim();
    if (t && !t.startsWith("#") && t.includes("=")) {
      const [k, ...rest] = t.split("=");
      envVars[k.trim()] = rest.join("=").trim();
    }
  });
}
const MONGO_URI = envVars.MONGODB_URI || envVars.MONGO_URL;

// ─── Section Classification ────────────────────────────────────────────
const SECTION_KEYWORDS = {
  ENGLISH: [
    "synonym", "antonym", "grammar", "sentence", "passage", "comprehension",
    "idiom", "phrase", "one word", "spelling", "error", "blank", "vocabulary",
    "cloze", "fill in", "rearrange", "para jumble", "active", "passive",
    "direct", "indirect", "parts of speech", "tense", "verb", "noun", "adverb",
    "adjective", "preposition", "conjunction", "article", "pronoun",
    "correctly spelt", "incorrectly spelt", "misspelt", "underlined",
  ],
  REASONING: [
    "series", "analogy", "coding", "decoding", "blood relation", "direction",
    "syllogism", "venn diagram", "matrix", "pattern", "mirror", "water image",
    "paper fold", "paper cut", "cube", "dice", "odd one", "classify",
    "sequence", "missing number", "figure", "alphabet", "clock", "calendar",
    "statement", "conclusion", "assumption", "ranking", "arrangement",
    "embedded", "counting", "triangle",
  ],
  GA: [
    "capital", "president", "minister", "country", "river", "mountain",
    "history", "geography", "constitution", "amendment", "article",
    "treaty", "war", "battle", "dynasty", "empire", "freedom", "movement",
    "scientist", "invention", "discovery", "element", "chemical", "physics",
    "biology", "cell", "organ", "disease", "vitamin", "mineral", "planet",
    "solar", "atmosphere", "climate", "ocean", "continent", "state",
    "festival", "dance", "temple", "monument", "UNESCO", "award", "prize",
    "sports", "olympics", "world cup", "currency", "GDP", "economy",
    "tax", "budget", "RBI", "bank", "scheme", "programme", "mission",
  ],
  QUANT: [
    "percent", "profit", "loss", "interest", "speed", "distance", "time",
    "ratio", "proportion", "average", "algebra", "equation", "triangle",
    "circle", "area", "volume", "perimeter", "diameter", "radius",
    "simplify", "fraction", "decimal", "HCF", "LCM", "factorial",
    "number system", "divisible", "remainder", "square root", "cube root",
    "km/h", "m/s", "km/hr", "metre", "litre", "kg", "cm", "₹",
    "Rs.", "Rs", "sold", "cost price", "selling price", "discount",
    "marked price", "compound interest", "simple interest",
    "work", "pipe", "cistern", "boat", "stream", "upstream", "downstream",
    "train", "platform", "bridge", "tunnel",
  ],
};

function classifySection(questionText, optionsText) {
  const combined = `${questionText} ${optionsText}`.toLowerCase();
  const scores = { REASONING: 0, GA: 0, QUANT: 0, ENGLISH: 0 };

  for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
    for (const kw of keywords) {
      if (combined.includes(kw.toLowerCase())) {
        scores[section] += kw.length > 4 ? 2 : 1;
      }
    }
  }

  // Check for math patterns
  if (/[\d]+\s*[+\-×÷*/]\s*[\d]+|=\s*\?|km\/h|m\/s|₹|Rs\.?|%/.test(combined)) {
    scores.QUANT += 3;
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (best[0][1] === 0) return "GA"; // default fallback
  return best[0][0];
}

function generateHash(questionText, options) {
  const normalized = `${questionText.trim().toLowerCase().replace(/\s+/g, " ")}|${(options.a || "").trim().toLowerCase()}|${(options.b || "").trim().toLowerCase()}|${(options.c || "").trim().toLowerCase()}|${(options.d || "").trim().toLowerCase()}`;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

// ─── Local Regex Parser ────────────────────────────────────────────────

// Map PDF section headers to our canonical sections
const SECTION_HEADER_MAP = {
  "english": "ENGLISH",
  "english language": "ENGLISH",
  "english comprehension": "ENGLISH",
  "general intelligence": "REASONING",
  "general intelligence and reasoning": "REASONING",
  "reasoning": "REASONING",
  "general awareness": "GA",
  "general knowledge": "GA",
  "general studies": "GA",
  "quantitative aptitude": "QUANT",
  "quantitative": "QUANT",
  "mathematics": "QUANT",
  "numerical aptitude": "QUANT",
  "numerical ability": "QUANT",
};

/**
 * Parse SSC/NBE style question text into structured questions.
 * Handles formats:
 *  - "Q.1 ... Ans 1. ... 2. ... 3. ... 4. ..."  (CHSL 2024, MTS 2024)
 *  - "Que. 1 ... Correct Option - N ... A1. ... B2. ... C3. ... D4." (NBE 2015)
 */
function parseQuestionsFromText(fullText, sourceExam, sourceYear) {
  const questions = [];
  const optMap = { "1": "a", "2": "b", "3": "c", "4": "d" };

  // ─── Strategy 1: CHSL 2024 / MTS 2024 format ─────────────────────────
  // Track section headers as they appear in the text
  let currentSection = null;

  // Split entire text by Q. markers, keeping track of section changes
  const blocks = [];
  const lines = fullText.split("\n");
  let currentBlock = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for section headers: "Section : General Intelligence"
    const sectionMatch = trimmed.match(/^Section\s*:\s*(.+)$/i);
    if (sectionMatch) {
      const sectionName = sectionMatch[1].trim().toLowerCase();
      for (const [key, val] of Object.entries(SECTION_HEADER_MAP)) {
        if (sectionName.includes(key)) {
          currentSection = val;
          break;
        }
      }
      continue;
    }

    // Check for Q.N start
    const qMatch = trimmed.match(/^Q\.(\d+)\b/);
    if (qMatch) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = {
        qNum: parseInt(qMatch[1]),
        section: currentSection,
        lines: [line],
      };
    } else if (currentBlock) {
      currentBlock.lines.push(line);
    }
  }
  if (currentBlock) blocks.push(currentBlock);

  for (const block of blocks) {
    const blockText = block.lines.join("\n").trim();

    // Remove Q.N prefix from start
    const withoutPrefix = blockText.replace(/^Q\.\d+\s*/, "").trim();

    // Find "Ans" marker
    const ansIdx = withoutPrefix.search(/\bAns\b/i);
    if (ansIdx === -1) continue;

    const questionText = withoutPrefix.slice(0, ansIdx).trim();
    const afterAns = withoutPrefix.slice(ansIdx + 3).trim();

    if (!questionText || questionText.length < 5) continue;

    // Parse options from after "Ans": "1. xxx  2. yyy  3. zzz  4. www"
    // Handle multiline options
    const opts = {};
    const optRegex = /(?:^|\n)\s*(\d)\.\s*([\s\S]*?)(?=(?:^|\n)\s*\d\.\s|$)/gm;
    let optMatch;

    while ((optMatch = optRegex.exec(afterAns)) !== null) {
      const num = optMatch[1];
      let text = optMatch[2].trim();
      // Clean trailing section markers and URLs
      text = text.replace(/Section\s*:.*/gi, "").replace(/https?:\/\/\S+/g, "").trim();
      if (optMap[num] && text.length > 0) {
        opts[optMap[num]] = text;
      }
    }

    // If regex didn't work, try split approach
    if (!opts.a || !opts.b) {
      const optParts = afterAns.split(/(?:^|\s)(\d)\.\s/);
      for (let i = 1; i < optParts.length; i += 2) {
        const num = optParts[i];
        const text = (optParts[i + 1] || "").trim()
          .replace(/Section\s*:.*/gi, "").replace(/https?:\/\/\S+/g, "").trim();
        if (optMap[num] && text) {
          opts[optMap[num]] = text;
        }
      }
    }

    // Skip if we don't have at least 2 options (image-only questions)
    if (!opts.a || !opts.b) continue;

    // Try to find correct answer
    let correctOption = null;
    const correctMatch = blockText.match(/Correct\s+(?:Answer|Option)\s*[-:]\s*(\d)/i);
    if (correctMatch) {
      correctOption = optMap[correctMatch[1]] || null;
    }

    // Determine section: prefer PDF section header, then heuristic
    const optionsText = `${opts.a || ""} ${opts.b || ""} ${opts.c || ""} ${opts.d || ""}`;
    const section = block.section || classifySection(questionText, optionsText);

    questions.push({
      questionText,
      options: {
        a: opts.a || "",
        b: opts.b || "",
        c: opts.c || "",
        d: opts.d || "",
      },
      correctOption,
      section,
      sourceExam,
      sourceYear,
    });
  }

  // ─── Strategy 2: NBE format (Que. N) ─────────────────────────────────
  if (questions.length === 0) {
    const nbePattern = /Que\.\s*(\d+)\s+([\s\S]*?)(?=Que\.\s*\d+|$)/gi;
    let match;
    while ((match = nbePattern.exec(fullText)) !== null) {
      const block = match[2].trim();

      // Find "Correct Option" marker
      const correctMatch = block.match(/Correct\s+Option\s*[-:]\s*(\d)/i);
      const correctNum = correctMatch ? correctMatch[1] : null;
      const correctOption = correctNum ? (optMap[correctNum] || null) : null;

      // Split block at "Correct Option" to get question text before it
      const correctIdx = block.search(/Correct\s+Option/i);
      const questionText = correctIdx > -1
        ? block.slice(0, correctIdx).trim()
        : block.trim();

      if (!questionText || questionText.length < 5) continue;

      // Parse options after "Correct Option - N"
      const afterCorrect = correctIdx > -1
        ? block.slice(correctIdx).replace(/Correct\s+Option\s*[-:]\s*\d/i, "").trim()
        : "";

      // Options: A1.\ntext\nB2.\ntext or just 1.\ntext\n2.\ntext
      const opts = {};
      const optPatternA = /([A-D])(\d)\.\s*([\s\S]*?)(?=[A-D]\d\.|$)/g;
      let optMatch;
      while ((optMatch = optPatternA.exec(afterCorrect)) !== null) {
        const letter = optMatch[1].toLowerCase();
        const text = optMatch[3].trim().replace(/https?:\/\/\S+/g, "").replace(/Page-\s*\d+/g, "").trim();
        if (text) opts[letter] = text;
      }

      // Fallback: numbered options
      if (!opts.a && !opts.b) {
        const numOptPattern = /(\d)\.\s*([\s\S]*?)(?=\d\.|$)/g;
        let numMatch;
        while ((numMatch = numOptPattern.exec(afterCorrect)) !== null) {
          const key = optMap[numMatch[1]];
          const text = numMatch[2].trim().replace(/https?:\/\/\S+/g, "").replace(/Page-\s*\d+/g, "").trim();
          if (key && text) opts[key] = text;
        }
      }

      if (!opts.a || !opts.b) continue;

      const optionsText = `${opts.a || ""} ${opts.b || ""} ${opts.c || ""} ${opts.d || ""}`;
      const section = classifySection(questionText, optionsText);

      questions.push({
        questionText,
        options: {
          a: opts.a || "",
          b: opts.b || "",
          c: opts.c || "",
          d: opts.d || "",
        },
        correctOption,
        section,
        sourceExam,
        sourceYear,
      });
    }
  }

  return questions;
}


// ─── MongoDB Schema (inline for standalone script) ──────────────────────
const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  contentHash: { type: String, index: true, sparse: true },
  section: { type: String, enum: ["REASONING", "GA", "QUANT", "ENGLISH"], required: true, index: true },
  questionText: { type: String, required: true },
  options: {
    a: { type: String, required: true },
    b: { type: String, required: true },
    c: { type: String, required: true },
    d: { type: String, required: true },
  },
  correctOption: { type: String, enum: ["a", "b", "c", "d", null], default: null },
  explanation: { type: String, default: "" },
  hasImage: { type: Boolean, default: false },
  imagePath: { type: String, default: "" },
  sourceExam: { type: String, default: "SSC_CHSL_PYQ", index: true },
  sourceYear: { type: Number, default: 2024 },
  difficulty: { type: String, enum: ["EASY", "MEDIUM", "HARD"], default: "MEDIUM" },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

const MockTestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  timeLimitMinutes: { type: Number, default: 120 },
  totalQuestions: { type: Number, default: 200 },
  sections: {
    REASONING: [String],
    GA: [String],
    QUANT: [String],
    ENGLISH: [String],
  },
}, { timestamps: true });

// ─── Main Pipeline ──────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  NBE ARENA — Bulk PDF Extraction & Mock Test Generator     ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  // Connect to MongoDB Atlas
  console.log("📡 Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGO_URI, {
    dbName: "nbe_arena",
    serverSelectionTimeoutMS: 10000,
  });
  console.log("✅ Connected to MongoDB Atlas\n");

  const QuestionModel = mongoose.models.Question || mongoose.model("Question", QuestionSchema);
  const MockTestModel = mongoose.models.MockTest || mongoose.model("MockTest", MockTestSchema);

  // ─── PHASE 1: Extract from all PDFs ──────────────────────────────────
  const pyqRoot = path.join(ROOT, "data", "pyq");
  const categories = fs.readdirSync(pyqRoot).filter(
    (d) => fs.statSync(path.join(pyqRoot, d)).isDirectory()
  );

  let allParsed = [];
  const stats = { totalPdfs: 0, totalParsed: 0, scannedSkipped: 0 };

  for (const cat of categories) {
    const catDir = path.join(pyqRoot, cat);
    const pdfs = fs.readdirSync(catDir).filter((f) => f.endsWith(".pdf"));
    console.log(`📂 Category: ${cat.toUpperCase()} (${pdfs.length} PDFs)`);

    for (const pdfFile of pdfs) {
      stats.totalPdfs++;
      const fullPath = path.join(catDir, pdfFile);
      const buf = fs.readFileSync(fullPath);
      const { totalPages, text } = await extractText(new Uint8Array(buf));
      const fullPdfText = Array.isArray(text) ? text.join("\n") : text;

      // Detect year from filename
      let year = 2024;
      const yearMatch = pdfFile.match(/20\d{2}/);
      if (yearMatch) year = parseInt(yearMatch[0]);

      const sourceExam = `${cat.toUpperCase()}_PYQ_${pdfFile.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40)}`;

      if (fullPdfText.length < 200) {
        console.log(`  ⏭️  ${pdfFile.slice(0, 55)}... → SCANNED (${fullPdfText.length} chars), skipping`);
        stats.scannedSkipped++;
        continue;
      }

      const parsed = parseQuestionsFromText(fullPdfText, sourceExam, year);
      console.log(`  ✅ ${pdfFile.slice(0, 55)}... → ${parsed.length} questions (${totalPages} pages)`);
      allParsed.push(...parsed);
      stats.totalParsed += parsed.length;
    }
  }

  console.log(`\n═══ EXTRACTION COMPLETE ═══`);
  console.log(`  PDFs scanned:    ${stats.totalPdfs}`);
  console.log(`  Scanned/skipped: ${stats.scannedSkipped}`);
  console.log(`  Total parsed:    ${stats.totalParsed}\n`);

  // ─── PHASE 2: Deduplicate & Insert into MongoDB ─────────────────────
  console.log("🔄 Deduplicating and inserting into MongoDB Atlas...");

  // Clear existing AI-extracted questions (keep seed questions)
  const deleteResult = await QuestionModel.deleteMany({
    id: { $regex: /^ext_/ },
  });
  console.log(`  🗑️  Cleared ${deleteResult.deletedCount} previous extracted questions`);

  const hashSet = new Set();
  const uniqueQuestions = [];

  for (const q of allParsed) {
    const hash = generateHash(q.questionText, q.options);
    if (hashSet.has(hash)) continue;
    hashSet.add(hash);
    uniqueQuestions.push({ ...q, contentHash: hash });
  }

  console.log(`  📊 Unique questions after dedup: ${uniqueQuestions.length} (removed ${allParsed.length - uniqueQuestions.length} duplicates)\n`);

  // Batch insert
  const batchSize = 100;
  let inserted = 0;
  for (let i = 0; i < uniqueQuestions.length; i += batchSize) {
    const batch = uniqueQuestions.slice(i, i + batchSize).map((q, idx) => ({
      id: `ext_${Date.now()}_${(i + idx).toString(36).padStart(4, "0")}`,
      contentHash: q.contentHash,
      section: q.section,
      questionText: q.questionText,
      options: q.options,
      correctOption: q.correctOption,
      explanation: "",
      hasImage: false,
      sourceExam: q.sourceExam,
      sourceYear: q.sourceYear,
      difficulty: "MEDIUM",
      isActive: true,
    }));

    try {
      await QuestionModel.insertMany(batch, { ordered: false });
      inserted += batch.length;
    } catch (err) {
      // Some duplicates from seed may cause errors, count successful ones
      if (err.insertedDocs) inserted += err.insertedDocs.length;
      else inserted += batch.length; // best effort
    }

    process.stdout.write(`\r  💾 Inserted ${inserted} / ${uniqueQuestions.length} questions...`);
  }
  console.log(`\n  ✅ Total inserted: ${inserted}\n`);

  // ─── PHASE 3: Check section distribution ─────────────────────────────
  const sectionCounts = await QuestionModel.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$section", count: { $sum: 1 } } },
  ]);

  console.log("📊 Question Bank Distribution:");
  const sectionMap = {};
  for (const s of sectionCounts) {
    sectionMap[s._id] = s.count;
    console.log(`  ${s._id}: ${s.count} questions`);
  }
  const totalBank = Object.values(sectionMap).reduce((a, b) => a + b, 0);
  console.log(`  TOTAL: ${totalBank} questions\n`);

  // ─── PHASE 4: Generate Mock Tests ────────────────────────────────────
  const MOCKS_TO_CREATE = Math.min(9, Math.floor(Math.min(
    (sectionMap.REASONING || 0) / 50,
    (sectionMap.GA || 0) / 50,
    (sectionMap.QUANT || 0) / 50,
    (sectionMap.ENGLISH || 0) / 50,
  )));

  const mockCount = Math.max(6, MOCKS_TO_CREATE);
  console.log(`🎯 Generating ${mockCount} mock tests (200 questions each, 50 per section)...\n`);

  // Delete existing mocks
  await MockTestModel.deleteMany({});

  // Fetch all questions by section
  const allQuestions = {};
  for (const section of ["REASONING", "GA", "QUANT", "ENGLISH"]) {
    allQuestions[section] = await QuestionModel.find({
      section,
      isActive: true,
    }).select("id").lean();
  }

  // Shuffle function
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Shuffle each section once
  const shuffled = {};
  for (const section of ["REASONING", "GA", "QUANT", "ENGLISH"]) {
    shuffled[section] = shuffle(allQuestions[section]);
  }

  const createdMocks = [];
  for (let m = 0; m < mockCount; m++) {
    const mockId = `mock_nbe_${(m + 1).toString().padStart(2, "0")}`;
    const title = `NBE Jr. Assistant Mock Test ${m + 1}`;

    const sections = {};
    let valid = true;

    for (const section of ["REASONING", "GA", "QUANT", "ENGLISH"]) {
      const pool = shuffled[section];
      const start = m * 50;
      const end = start + 50;

      if (end > pool.length) {
        // Wrap around with shuffle for diversity
        const available = pool.slice(start);
        const needed = 50 - available.length;
        const extra = shuffle(pool.slice(0, needed));
        sections[section] = [...available, ...extra].map((q) => q.id);
      } else {
        sections[section] = pool.slice(start, end).map((q) => q.id);
      }

      if (sections[section].length < 50) {
        console.log(`  ⚠️  Only ${sections[section].length} questions for ${section} in Mock ${m + 1}`);
        // Pad with random from same section
        while (sections[section].length < 50 && pool.length > 0) {
          const random = pool[Math.floor(Math.random() * pool.length)];
          if (!sections[section].includes(random.id)) {
            sections[section].push(random.id);
          }
        }
      }
    }

    const totalQ = Object.values(sections).reduce((s, arr) => s + arr.length, 0);

    const mock = {
      id: mockId,
      title,
      timeLimitMinutes: 120,
      totalQuestions: totalQ,
      sections,
    };

    await MockTestModel.findOneAndUpdate({ id: mockId }, mock, { upsert: true });
    createdMocks.push(mock);
    console.log(`  ✅ Created: "${title}" (${totalQ} questions)`);
  }

  // ─── PHASE 5: Summary Report ─────────────────────────────────────────
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║                    PIPELINE COMPLETE                       ║");
  console.log("╠══════════════════════════════════════════════════════════════╣");
  console.log(`║  PDFs processed:        ${stats.totalPdfs.toString().padStart(6)}                           ║`);
  console.log(`║  Scanned (skipped):     ${stats.scannedSkipped.toString().padStart(6)}                           ║`);
  console.log(`║  Questions extracted:   ${stats.totalParsed.toString().padStart(6)}                           ║`);
  console.log(`║  Unique (after dedup):  ${uniqueQuestions.length.toString().padStart(6)}                           ║`);
  console.log(`║  Inserted to MongoDB:   ${inserted.toString().padStart(6)}                           ║`);
  console.log(`║  Mock tests generated:  ${createdMocks.length.toString().padStart(6)}                           ║`);
  console.log("╚══════════════════════════════════════════════════════════════╝");

  await mongoose.disconnect();
  console.log("\n🔌 Disconnected from MongoDB Atlas. Done!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Pipeline failed:", err);
  process.exit(1);
});
