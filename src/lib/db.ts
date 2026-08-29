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

const EMPTY_OPTIONS = { a: "", b: "", c: "", d: "" };

/**
 * Single Mongo -> Question mapper. Figure fields have to be carried through here
 * or the CBT screen silently falls back to text-only rendering and non-verbal
 * questions become unanswerable.
 */
function toQuestion(doc: Record<string, any>): Question {
  return {
    id: doc.id,
    contentHash: doc.contentHash,
    section: doc.section as SectionType,
    questionText: doc.questionText,
    options: doc.options,
    correctOption: doc.correctOption as Question["correctOption"],
    answerConfidence: doc.answerConfidence as Question["answerConfidence"],
    explanation: doc.explanation,
    hasImage: doc.hasImage,
    imagePath: doc.imagePath,
    optionImages: doc.optionImages ? { ...EMPTY_OPTIONS, ...doc.optionImages } : undefined,
    optionsAreImages: doc.optionsAreImages,
    stemIsFigureOnly: doc.stemIsFigureOnly,
    figureCount: doc.figureCount,
    figureKind: doc.figureKind as Question["figureKind"],
    topic: doc.topic,
    sourceExam: doc.sourceExam,
    sourceYear: doc.sourceYear,
    sourcePage: doc.sourcePage,
    sourceQuestionNumber: doc.sourceQuestionNumber,
    difficulty: doc.difficulty as Question["difficulty"],
    isActive: doc.isActive,
    createdAt: doc.createdAt?.toISOString?.() || new Date().toISOString(),
  };
}

export async function getQuestions(): Promise<Question[]> {
  try {
    await connectToDatabase();
    await ensureSeedQuestions();
    const docs = await QuestionModel.find({}).lean();
    return docs.map(toQuestion);
  } catch (error) {
    console.error("MongoDB getQuestions error, falling back to seed file:", error);
    const seedPath = path.join(process.cwd(), "data", "seed-questions.json");
    if (fs.existsSync(seedPath)) {
      return JSON.parse(fs.readFileSync(seedPath, "utf-8"));
    }
    return [];
  }
}

export async function getQuestionsByIds(ids: string[]): Promise<Question[]> {
  try {
    await connectToDatabase();
    const docs = await QuestionModel.find({ id: { $in: ids } }).lean();
    return docs.map(toQuestion);
  } catch (error) {
    console.error("MongoDB getQuestionsByIds error:", error);
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
  await connectToDatabase();
  await ensureSeedQuestions();

  // Optimized aggregation for fast bank statistics
  const [countsBySection, activeBySectionRaw, sourcesRaw, totalDocs] = await Promise.all([
    QuestionModel.aggregate([
      { $group: { _id: "$section", count: { $sum: 1 } } },
    ]),
    QuestionModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$section", count: { $sum: 1 } } },
    ]),
    QuestionModel.aggregate([
      { $group: { _id: "$sourceExam", count: { $sum: 1 } } },
    ]),
    QuestionModel.countDocuments(),
  ]);

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

  for (const item of countsBySection) {
    if (bySection[item._id as SectionType] !== undefined) {
      bySection[item._id as SectionType] = item.count;
    }
  }

  for (const item of activeBySectionRaw) {
    if (activeBySection[item._id as SectionType] !== undefined) {
      activeBySection[item._id as SectionType] = item.count;
    }
  }

  const sources = sourcesRaw.map((s) => ({
    sourceExam: s._id || "Official PYQ",
    count: s.count,
  }));

  const activeTotal = Object.values(activeBySection).reduce((a, b) => a + b, 0);

  return {
    total: totalDocs,
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
