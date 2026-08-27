import mongoose, { Schema, Document, Model } from "mongoose";
import { SectionType, OptionKey } from "@/types";

export interface IQuestionDocument extends Document {
  id: string; // custom stable id (e.g. seed_reasoning_001)
  section: SectionType;
  questionText: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctOption: OptionKey | null;
  explanation?: string;
  hasImage: boolean;
  imagePath?: string;
  sourceExam: string;
  sourceYear?: number;
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
    explanation: {
      type: String,
      default: "",
    },
    hasImage: {
      type: Boolean,
      default: false,
    },
    imagePath: {
      type: String,
      default: "",
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
