import mongoose, { Schema, Document } from "mongoose";

export interface IPolicy extends Document {
  title: string;
  category: "HR Policy" | "Code of Conduct" | "IT Policy" | "Leave Policy" | "Other";
  content: string;
  version: string;
  effectiveDate: Date;
  isActive: boolean;
  postedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PolicySchema = new Schema<IPolicy>(
  {
    title: { type: String, required: true },
    category: { type: String, enum: ["HR Policy", "Code of Conduct", "IT Policy", "Leave Policy", "Other"], required: true },
    content: { type: String, required: true },
    version: { type: String, default: "1.0" },
    effectiveDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Policy = mongoose.models.Policy || mongoose.model<IPolicy>("Policy", PolicySchema);
