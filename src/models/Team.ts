import mongoose, { Schema, Document } from "mongoose";

export interface ITeam extends Document {
  name: string;
  description?: string;
  projectName: string;
  projectDeadline: Date;
  managerId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  shift: {
    type: "Morning" | "Evening" | "Night";
    startTime: string;
    endTime: string;
  };
  updates: {
    content: string;
    userId: mongoose.Types.ObjectId;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    description: { type: String },
    projectName: { type: String, required: true },
    projectDeadline: { type: Date, required: true },
    managerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    shift: {
      type: { type: String, enum: ["Morning", "Evening", "Night"], default: "Morning" },
      startTime: { type: String, default: "09:00" },
      endTime: { type: String, default: "17:00" },
    },
    updates: [
      {
        content: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Team = mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);
