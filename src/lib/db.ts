import fs from "fs";
import path from "path";
import { Question, MockTest, Attempt, BankStats, SectionType } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const QUESTIONS_FILE = path.join(DATA_DIR, "questions.json");
const SEED_QUESTIONS_FILE = path.join(DATA_DIR, "seed-questions.json");
const MOCKS_FILE = path.join(DATA_DIR, "mocks.json");
const ATTEMPTS_FILE = path.join(DATA_DIR, "attempts.json");

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(QUESTIONS_FILE)) {
    if (fs.existsSync(SEED_QUESTIONS_FILE)) {
      const seedData = fs.readFileSync(SEED_QUESTIONS_FILE, "utf-8");
      fs.writeFileSync(QUESTIONS_FILE, seedData, "utf-8");
    } else {
      fs.writeFileSync(QUESTIONS_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  }

  if (!fs.existsSync(MOCKS_FILE)) {
    fs.writeFileSync(MOCKS_FILE, JSON.stringify([], null, 2), "utf-8");
  }

  if (!fs.existsSync(ATTEMPTS_FILE)) {
    fs.writeFileSync(ATTEMPTS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

// ----------------- QUESTIONS -----------------

export async function getQuestions(): Promise<Question[]> {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(QUESTIONS_FILE, "utf-8");
    const questions: Question[] = JSON.parse(raw);
    return questions;
  } catch (error) {
    console.error("Error reading questions.json:", error);
    return [];
  }
}

export async function saveQuestions(questions: Question[]): Promise<void> {
  ensureDataFiles();
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2), "utf-8");
}

export async function appendQuestions(newQuestions: Question[]): Promise<{ added: number; total: number }> {
  ensureDataFiles();
  const existing = await getQuestions();
  const existingMap = new Map(existing.map((q) => [q.id, q]));

  let added = 0;
  for (const q of newQuestions) {
    if (!existingMap.has(q.id)) {
      existingMap.set(q.id, q);
      added++;
    }
  }

  const updated = Array.from(existingMap.values());
  await saveQuestions(updated);
  return { added, total: updated.length };
}

export async function getBankStats(): Promise<BankStats> {
  const questions = await getQuestions();

  const bySection: Record<SectionType, number> = {
    REASONING: 0,
    GA: 0,
    QUANT: 0,
    ENGLISH: 0,
  };

  const activeBySection: Record<SectionType, number> = {
    REASONING: 0,
    GA: 0,
    QUANT: 0,
    ENGLISH: 0,
  };

  const sourceMap = new Map<string, number>();

  for (const q of questions) {
    if (bySection[q.section] !== undefined) {
      bySection[q.section]++;
      if (q.isActive) {
        activeBySection[q.section]++;
      }
    }
    const src = q.sourceExam || "Unknown";
    sourceMap.set(src, (sourceMap.get(src) || 0) + 1);
  }

  const sources = Array.from(sourceMap.entries()).map(([sourceExam, count]) => ({
    sourceExam,
    count,
  }));

  const activeTotal = Object.values(activeBySection).reduce((a, b) => a + b, 0);

  return {
    total: questions.length,
    bySection,
    activeTotal,
    activeBySection,
    sources,
  };
}

// ----------------- MOCKS -----------------

export async function getMocks(): Promise<MockTest[]> {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(MOCKS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading mocks.json:", error);
    return [];
  }
}

export async function getMockById(mockId: string): Promise<MockTest | null> {
  const mocks = await getMocks();
  return mocks.find((m) => m.id === mockId) || null;
}

export async function saveMock(mock: MockTest): Promise<void> {
  ensureDataFiles();
  const mocks = await getMocks();
  const index = mocks.findIndex((m) => m.id === mock.id);
  if (index >= 0) {
    mocks[index] = mock;
  } else {
    mocks.unshift(mock); // newest first
  }
  fs.writeFileSync(MOCKS_FILE, JSON.stringify(mocks, null, 2), "utf-8");
}

// ----------------- ATTEMPTS -----------------

export async function getAttempts(): Promise<Attempt[]> {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(ATTEMPTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading attempts.json:", error);
    return [];
  }
}

export async function getAttemptById(attemptId: string): Promise<Attempt | null> {
  const attempts = await getAttempts();
  return attempts.find((a) => a.id === attemptId) || null;
}

export async function saveAttempt(attempt: Attempt): Promise<void> {
  ensureDataFiles();
  const attempts = await getAttempts();
  const index = attempts.findIndex((a) => a.id === attempt.id);
  if (index >= 0) {
    attempts[index] = attempt;
  } else {
    attempts.unshift(attempt); // newest first
  }
  fs.writeFileSync(ATTEMPTS_FILE, JSON.stringify(attempts, null, 2), "utf-8");
}
