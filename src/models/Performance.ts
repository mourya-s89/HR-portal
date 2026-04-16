import mongoose, { Schema, Document } from "mongoose";

export interface IPerformance extends Document {
  userId: mongoose.Types.ObjectId;
  month: number;
  year: number;
  rating: number;
  managerRemarks?: string;
  goals?: string;
  responsibilities?: string;
  selfAssessment?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PerformanceSchema = new Schema<IPerformance>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    managerRemarks: { type: String },
    goals: { type: String },
    responsibilities: { type: String },
    selfAssessment: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

PerformanceSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

export const Performance = mongoose.models.Performance || mongoose.model<IPerformance>("Performance", PerformanceSchema);
