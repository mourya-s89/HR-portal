import mongoose, { Schema, Document } from "mongoose";

export interface ISOP extends Document {
  title: string;
  department: string;
  category: string;
  content: string;
  version: string;
  isActive: boolean;
  postedBy: mongoose.Types.ObjectId;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SOPSchema = new Schema<ISOP>(
  {
    title: { type: String, required: true },
    department: { type: String, required: true },
    category: { type: String, required: true },
    content: { type: String, required: true },
    version: { type: String, default: "1.0" },
    isActive: { type: Boolean, default: true },
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export const SOP = mongoose.models.SOP || mongoose.model<ISOP>("SOP", SOPSchema);
