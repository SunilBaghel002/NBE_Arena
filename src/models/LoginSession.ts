import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILoginSession extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  loginAt: Date;
  logoutAt?: Date;
  sessionDurationSeconds: number;
  ipAddress?: string | null;
  userAgent?: string | null;
  device: "Desktop" | "Mobile" | "Tablet" | "Unknown";
  approxLocation?: string | null;
  pagesVisited: string[];
  lastActivityAt: Date;
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LoginSessionSchema = new Schema<ILoginSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    username: { type: String, required: true, index: true },
    loginAt: { type: Date, default: Date.now, required: true },
    logoutAt: { type: Date },
    sessionDurationSeconds: { type: Number, default: 0 },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    device: {
      type: String,
      enum: ["Desktop", "Mobile", "Tablet", "Unknown"],
      default: "Desktop",
    },
    approxLocation: { type: String, default: null },
    pagesVisited: { type: [String], default: [] },
    lastActivityAt: { type: Date, default: Date.now, required: true, index: true },
    isClosed: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Compound index for fast per-user timeline querying
LoginSessionSchema.index({ userId: 1, loginAt: -1 });
LoginSessionSchema.index({ isClosed: 1, lastActivityAt: -1 });

export const LoginSessionModel: Model<ILoginSession> =
  mongoose.models.LoginSession ||
  mongoose.model<ILoginSession>("LoginSession", LoginSessionSchema);

export default LoginSessionModel;
