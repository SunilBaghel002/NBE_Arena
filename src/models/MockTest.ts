import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMockTestDocument extends Document {
  id: string; // custom id (e.g. mock_1787834306492_63i4b)
  title: string;
  timeLimitMinutes: number;
  totalQuestions: number;
  sections: {
    REASONING: string[];
    GA: string[];
    QUANT: string[];
    ENGLISH: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const MockTestSchema = new Schema<IMockTestDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    timeLimitMinutes: {
      type: Number,
      default: 180,
    },
    totalQuestions: {
      type: Number,
      default: 200,
    },
    sections: {
      REASONING: [{ type: String }],
      GA: [{ type: String }],
      QUANT: [{ type: String }],
      ENGLISH: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

export const MockTestModel: Model<IMockTestDocument> =
  mongoose.models.MockTest || mongoose.model<IMockTestDocument>("MockTest", MockTestSchema);
