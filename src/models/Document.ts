import mongoose, { Schema, Document } from "mongoose";

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId; // Original owner
  uploadedBy: mongoose.Types.ObjectId;
  sharedWith: mongoose.Types.ObjectId[]; // People who can view/download
  name: string;
  category: "Personal" | "Payslip" | "Certificate" | "Policy" | "Contract" | "Other";
  fileData: Buffer;
  fileType: string;
  fileSize: number;
  month?: number;
  year?: number;
  createdAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: "User" }],
    name: { type: String, required: true },
    category: { type: String, enum: ["Personal", "Payslip", "Certificate", "Policy", "Contract", "Other"], default: "Other" },
    fileData: { type: Buffer, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    month: { type: Number, min: 1, max: 12 },
    year: { type: Number },
  },
  { timestamps: true }
);

export const HRDocument = mongoose.models.HRDocument || mongoose.model<IDocument>("HRDocument", DocumentSchema);
