import mongoose, { Schema, Document } from "mongoose";

export interface IExitInterview extends Document {
  userId: mongoose.Types.ObjectId;
  resignationDate: Date;
  lastWorkingDate: Date;
  reasonForLeaving: string;
  overallExperience: number;
  likeMost?: string;
  improvementSuggestions?: string;
  wouldRecommend: boolean;
  managerFeedback?: string;
  status: "Draft" | "Submitted";
  reviewedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ExitInterviewSchema = new Schema<IExitInterview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resignationDate: { type: Date, required: true },
    lastWorkingDate: { type: Date, required: true },
    reasonForLeaving: { type: String, required: true },
    overallExperience: { type: Number, required: true, min: 1, max: 5 },
    likeMost: { type: String },
    improvementSuggestions: { type: String },
    wouldRecommend: { type: Boolean, default: false },
    managerFeedback: { type: String },
    status: { type: String, enum: ["Draft", "Submitted"], default: "Draft" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const ExitInterview = mongoose.models.ExitInterview || mongoose.model<IExitInterview>("ExitInterview", ExitInterviewSchema);
