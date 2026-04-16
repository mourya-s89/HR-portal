import mongoose, { Schema, Document } from "mongoose";

export interface IWorkUpdate extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  tasksCompleted: string;
  hoursSpent: number;
  blockers?: string;
  nextDayPlan?: string;
  createdAt: Date;
}

const WorkUpdateSchema = new Schema<IWorkUpdate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    tasksCompleted: { type: String, required: true },
    hoursSpent: { type: Number, required: true, min: 0, max: 24 },
    blockers: { type: String },
    nextDayPlan: { type: String },
  },
  { timestamps: true }
);

export const WorkUpdate = mongoose.models.WorkUpdate || mongoose.model<IWorkUpdate>("WorkUpdate", WorkUpdateSchema);
