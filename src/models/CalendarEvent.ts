import mongoose, { Schema, Document } from "mongoose";

export interface ICalendarEvent extends Document {
  title: string;
  date: Date;
  endDate?: Date;
  type: "Holiday" | "Event" | "Leave" | "Meeting" | "Deadline";
  description?: string;
  color?: string;
  isPublic: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    endDate: { type: Date },
    type: { type: String, enum: ["Holiday", "Event", "Leave", "Meeting", "Deadline"], required: true },
    description: { type: String },
    color: { type: String, default: "#6366f1" },
    isPublic: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const CalendarEvent = mongoose.models.CalendarEvent || mongoose.model<ICalendarEvent>("CalendarEvent", CalendarEventSchema);
