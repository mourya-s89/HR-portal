import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  fromUser: mongoose.Types.ObjectId;
  toUser?: mongoose.Types.ObjectId;
  type: "General" | "Peer" | "Manager" | "Anonymous";
  rating: number;
  message: string;
  isAnonymous: boolean;
  category: "Work Environment" | "Management" | "Team" | "Process" | "Other";
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["General", "Peer", "Manager", "Anonymous"], default: "General" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    category: { type: String, enum: ["Work Environment", "Management", "Team", "Process", "Other"], default: "Other" },
  },
  { timestamps: true }
);

export const Feedback = mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", FeedbackSchema);
