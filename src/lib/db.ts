import fs from "fs";
import path from "path";
import { connectToDatabase } from "./mongodb";
import { QuestionModel } from "@/models/Question";
import { MockTestModel } from "@/models/MockTest";
import { AttemptModel } from "@/models/Attempt";
import { Question, MockTest, Attempt, BankStats, SectionType } from "@/types";

// Auto-seed questions into MongoDB if collection is empty
async function ensureSeedQuestions() {
  await connectToDatabase();
  const count = await QuestionModel.countDocuments();
  if (count === 0) {
    const seedPath = path.join(process.cwd(), "data", "seed-questions.json");
    if (fs.existsSync(seedPath)) {
      try {
        const raw = fs.readFileSync(seedPath, "utf-8");
        const seedQuestions: Question[] = JSON.parse(raw);
        if (seedQuestions.length > 0) {
          await QuestionModel.insertMany(seedQuestions, { ordered: false }).catch(() => {});
          console.log(`Auto-seeded ${seedQuestions.length} questions to MongoDB Atlas.`);
        }
      } catch (err) {
        console.error("Error seeding questions into MongoDB:", err);
      }
    }
  }
}

// ----------------- QUESTIONS -----------------

export async function getQuestions(): Promise<Question[]> {
  try {
    await connectToDatabase();
    await ensureSeedQuestions();
    const docs = await QuestionModel.find({}).lean();
    return docs.map((doc) => ({
      id: doc.id,
      section: doc.section as SectionType,
      questionText: doc.questionText,
      options: doc.options,
      correctOption: doc.correctOption as Question["correctOption"],
      explanation: doc.explanation,
      hasImage: doc.hasImage,
      imagePath: doc.imagePath,
      sourceExam: doc.sourceExam,
      sourceYear: doc.sourceYear,
      difficulty: doc.difficulty as Question["difficulty"],
      isActive: doc.isActive,
      createdAt: doc.createdAt?.toISOString?.() || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("MongoDB getQuestions error, falling back to seed file:", error);
    const seedPath = path.join(process.cwd(), "data", "seed-questions.json");
    if (fs.existsSync(seedPath)) {
      return JSON.parse(fs.readFileSync(seedPath, "utf-8"));
    }
    return [];
  }
}

export async function saveQuestions(questions: Question[]): Promise<void> {
  await connectToDatabase();
  for (const q of questions) {
    await QuestionModel.findOneAndUpdate({ id: q.id }, q, { upsert: true });
  }
}

export async function appendQuestions(newQuestions: Question[]): Promise<{ added: number; total: number }> {
  await connectToDatabase();
  let added = 0;
  for (const q of newQuestions) {
    const existing = await QuestionModel.findOne({ id: q.id });
    if (!existing) {
      await QuestionModel.create(q);
      added++;
    }
  }
  const total = await QuestionModel.countDocuments();
  return { added, total };
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
  try {
    await connectToDatabase();
    const docs = await MockTestModel.find({}).sort({ createdAt: -1 }).lean();
    return docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      createdAt: doc.createdAt?.toISOString?.() || new Date().toISOString(),
      timeLimitMinutes: doc.timeLimitMinutes || 180,
      totalQuestions: doc.totalQuestions || 200,
      sections: {
        REASONING: doc.sections?.REASONING || [],
        GA: doc.sections?.GA || [],
        QUANT: doc.sections?.QUANT || [],
        ENGLISH: doc.sections?.ENGLISH || [],
      },
    }));
  } catch (error) {
    console.error("MongoDB getMocks error:", error);
    return [];
  }
}

export async function getMockById(mockId: string): Promise<MockTest | null> {
  try {
    await connectToDatabase();
    const doc = await MockTestModel.findOne({ id: mockId }).lean();
    if (!doc) return null;
    return {
      id: doc.id,
      title: doc.title,
      createdAt: doc.createdAt?.toISOString?.() || new Date().toISOString(),
      timeLimitMinutes: doc.timeLimitMinutes || 180,
      totalQuestions: doc.totalQuestions || 200,
      sections: {
        REASONING: doc.sections?.REASONING || [],
        GA: doc.sections?.GA || [],
        QUANT: doc.sections?.QUANT || [],
        ENGLISH: doc.sections?.ENGLISH || [],
      },
    };
  } catch (error) {
    console.error("MongoDB getMockById error:", error);
    return null;
  }
}

export async function saveMock(mock: MockTest): Promise<void> {
  await connectToDatabase();
  await MockTestModel.findOneAndUpdate({ id: mock.id }, mock, { upsert: true });
}

// ----------------- ATTEMPTS -----------------

export async function getAttempts(userId?: string): Promise<Attempt[]> {
  try {
    await connectToDatabase();
    const query = userId ? { userId } : {};
    const docs = await AttemptModel.find(query).sort({ createdAt: -1 }).lean();
    return docs.map((doc) => ({
      id: doc.id,
      userId: doc.userId,
      userName: doc.userName,
      mockId: doc.mockId,
      startedAt: doc.startedAt?.toISOString?.() || new Date().toISOString(),
      submittedAt: doc.submittedAt?.toISOString?.() || undefined,
      timeTakenSeconds: doc.timeTakenSeconds,
      answers: doc.answers as Attempt["answers"],
      score: doc.score,
    }));
  } catch (error) {
    console.error("MongoDB getAttempts error:", error);
    return [];
  }
}

export async function getAttemptById(attemptId: string): Promise<Attempt | null> {
  try {
    await connectToDatabase();
    const doc = await AttemptModel.findOne({ id: attemptId }).lean();
    if (!doc) return null;
    return {
      id: doc.id,
      userId: doc.userId,
      userName: doc.userName,
      mockId: doc.mockId,
      startedAt: doc.startedAt?.toISOString?.() || new Date().toISOString(),
      submittedAt: doc.submittedAt?.toISOString?.() || undefined,
      timeTakenSeconds: doc.timeTakenSeconds,
      answers: doc.answers as Attempt["answers"],
      score: doc.score,
    };
  } catch (error) {
    console.error("MongoDB getAttemptById error:", error);
    return null;
  }
}

export async function saveAttempt(attempt: Attempt): Promise<void> {
  await connectToDatabase();
  await AttemptModel.findOneAndUpdate({ id: attempt.id }, attempt, { upsert: true });
}
