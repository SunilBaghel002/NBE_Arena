import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const MONGO_URL =
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  "mongodb+srv://sunilbaghel93100_db_user:GZX8oPTUz9Pu4q5w@arena0.rl90lbr.mongodb.net/?appName=arena0";

// Define inline schemas for standalone script testing
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["admin", "student"], default: "student" },
  },
  { timestamps: true }
);

const QuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
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
    sourceExam: { type: String, default: "SSC_CHSL_PYQ" },
    sourceYear: { type: Number, default: 2023 },
    difficulty: { type: String, default: "MEDIUM" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Question = mongoose.models.Question || mongoose.model("Question", QuestionSchema);

async function main() {
  console.log("Connecting to MongoDB Atlas at:", MONGO_URL.replace(/:([^@]+)@/, ":****@"));
  await mongoose.connect(MONGO_URL);
  console.log("✓ Connected to MongoDB Atlas successfully!");

  // 1. Seed Users
  const userCount = await User.countDocuments();
  console.log(`Current users in MongoDB: ${userCount}`);

  if (userCount === 0) {
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash("nbe2026", salt);
    const adminPasswordHash = await bcrypt.hash("admin123", salt);

    const defaultUsers = [
      { username: "admin", passwordHash: adminPasswordHash, name: "Exam Administrator", role: "admin" },
      { username: "sunil", passwordHash: defaultPasswordHash, name: "Sunil Baghel", role: "admin" },
      { username: "candidate1", passwordHash: defaultPasswordHash, name: "Candidate 1", role: "student" },
      { username: "candidate2", passwordHash: defaultPasswordHash, name: "Candidate 2", role: "student" },
    ];

    await User.insertMany(defaultUsers);
    console.log("✓ Seeded 4 default candidate accounts (sunil, candidate1, candidate2, admin).");
  } else {
    const users = await User.find({}, "username name role").lean();
    console.log("Existing users:", users);
  }

  // 2. Seed 200 Questions
  const qCount = await Question.countDocuments();
  console.log(`Current questions in MongoDB Atlas: ${qCount}`);

  if (qCount < 200) {
    const seedPath = path.join(process.cwd(), "data", "seed-questions.json");
    if (fs.existsSync(seedPath)) {
      const raw = fs.readFileSync(seedPath, "utf-8");
      const seedList = JSON.parse(raw);
      console.log(`Found ${seedList.length} seed questions locally. Upserting to MongoDB Atlas...`);

      for (const q of seedList) {
        await Question.findOneAndUpdate({ id: q.id }, q, { upsert: true });
      }
      const newCount = await Question.countDocuments();
      console.log(`✓ MongoDB Atlas now contains ${newCount} questions.`);
    }
  }

  // 3. Verify Section Distribution in MongoDB Atlas
  const reasoningCount = await Question.countDocuments({ section: "REASONING", isActive: true });
  const gaCount = await Question.countDocuments({ section: "GA", isActive: true });
  const quantCount = await Question.countDocuments({ section: "QUANT", isActive: true });
  const englishCount = await Question.countDocuments({ section: "ENGLISH", isActive: true });

  console.log("MongoDB Section Distribution:", {
    Reasoning: reasoningCount,
    GA: gaCount,
    Quant: quantCount,
    English: englishCount,
  });

  if (reasoningCount >= 50 && gaCount >= 50 && quantCount >= 50 && englishCount >= 50) {
    console.log("✓ Verified: MongoDB Atlas has >= 50 active questions in all 4 sections for 200Q NBE mocks!");
  } else {
    console.warn("⚠️ Warning: Section count is less than 50 in some sections.");
  }

  await mongoose.disconnect();
  console.log("Disconnected cleanly from MongoDB.");
}

main().catch((err) => {
  console.error("MongoDB Atlas Seeding/Test failed:", err);
  process.exit(1);
});
