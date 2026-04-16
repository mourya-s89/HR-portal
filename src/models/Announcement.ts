import mongoose, { Schema, Document } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  priority: "Urgent" | "General" | "Event";
  pinned: boolean;
  postedBy: mongoose.Types.ObjectId;
  targetRoles: string[];
  readBy: mongoose.Types.ObjectId[];
  expiresAt?: Date;
  createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    priority: { type: String, enum: ["Urgent", "General", "Event"], default: "General" },
    pinned: { type: Boolean, default: false },
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetRoles: { type: [String], default: ["Admin", "HR", "Employee"] },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export const Announcement = mongoose.models.Announcement || mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);
