import mongoose, { Schema, Document, Model } from "mongoose";
import { AttemptScore, AnswerState } from "@/types";

export interface IAttemptDocument extends Document {
  id: string; // unique attempt id (e.g. att_1787834306492_63i4b)
  userId?: string; // ID of candidate user
  userName?: string; // Display name
  mockId: string;
  startedAt: Date;
  submittedAt?: Date;
  timeTakenSeconds: number;
  answers: AnswerState[];
  score?: AttemptScore;
  aiAnalysis?: any;
  createdAt: Date;
  updatedAt: Date;
}

const AttemptSchema = new Schema<IAttemptDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    userName: {
      type: String,
      default: "Candidate",
    },
    mockId: {
      type: String,
      required: true,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    timeTakenSeconds: {
      type: Number,
      default: 0,
    },
    answers: [
      {
        questionId: { type: String, required: true },
        selectedOption: { type: String, enum: ["a", "b", "c", "d", null], default: null },
        status: {
          type: String,
          enum: ["answered", "marked", "answered_marked", "not_visited", "unanswered"],
          default: "not_visited",
        },
        timeSpentSeconds: { type: Number, default: 0 },
      },
    ],
    score: {
      type: Schema.Types.Mixed,
    },
    aiAnalysis: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export const AttemptModel: Model<IAttemptDocument> =
  mongoose.models.Attempt || mongoose.model<IAttemptDocument>("Attempt", AttemptSchema);
