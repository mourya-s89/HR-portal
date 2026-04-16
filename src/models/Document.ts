import mongoose, { Schema, Document } from "mongoose";

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
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
