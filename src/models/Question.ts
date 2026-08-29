import mongoose, { Schema, Document, Model } from "mongoose";
import { SectionType, OptionKey, AnswerConfidence, FigureKind } from "@/types";

export interface IQuestionDocument extends Document {
  id: string; // custom stable id (e.g. seed_reasoning_001 or ext_178783...)
  contentHash?: string; // SHA-256 hash for deduplication
  section: SectionType;
  questionText: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctOption: OptionKey | null;
  answerConfidence?: AnswerConfidence;
  explanation?: string;
  hasImage: boolean;
  imagePath?: string;
  optionImages?: { a: string; b: string; c: string; d: string };
  optionsAreImages?: boolean;
  stemIsFigureOnly?: boolean;
  figureCount?: number;
  figureKind?: FigureKind;
  topic?: string;
  sourceExam: string;
  sourceYear?: number;
  sourcePage?: number;
  sourceQuestionNumber?: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestionDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    contentHash: {
      type: String,
      index: true,
      sparse: true,
    },
    section: {
      type: String,
      enum: ["REASONING", "GA", "QUANT", "ENGLISH"],
      required: true,
      index: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    options: {
      a: { type: String, required: true },
      b: { type: String, required: true },
      c: { type: String, required: true },
      d: { type: String, required: true },
    },
    correctOption: {
      type: String,
      enum: ["a", "b", "c", "d", null],
      default: null,
    },
    answerConfidence: {
      type: String,
      enum: ["high", "medium", "none"],
      default: "none",
      index: true,
    },
    explanation: {
      type: String,
      default: "",
    },
    hasImage: {
      type: Boolean,
      default: false,
      index: true,
    },
    imagePath: {
      type: String,
      default: "",
    },
    // Non-verbal reasoning options are pictures. Kept separate from `options` so
    // the text fields stay usable for search and dedupe.
    optionImages: {
      a: { type: String, default: "" },
      b: { type: String, default: "" },
      c: { type: String, default: "" },
      d: { type: String, default: "" },
    },
    optionsAreImages: {
      type: Boolean,
      default: false,
    },
    stemIsFigureOnly: {
      type: Boolean,
      default: false,
    },
    figureCount: {
      type: Number,
      default: 0,
    },
    figureKind: {
      type: String,
      enum: ["table", "chart", "diagram", ""],
      default: "",
      index: true,
    },
    topic: {
      type: String,
      default: "",
      index: true,
    },
    sourceExam: {
      type: String,
      default: "SSC_CHSL_PYQ",
      index: true,
    },
    sourceYear: {
      type: Number,
      default: 2023,
    },
    // Provenance: which PDF page and printed question number this came from.
    sourcePage: {
      type: Number,
    },
    sourceQuestionNumber: {
      type: Number,
    },
    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      default: "MEDIUM",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const QuestionModel: Model<IQuestionDocument> =
  mongoose.models.Question || mongoose.model<IQuestionDocument>("Question", QuestionSchema);
