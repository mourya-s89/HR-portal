import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  checkInLocation?: { lat: number; lng: number; address?: string };
  checkOutLocation?: { lat: number; lng: number; address?: string };
  totalHours?: number;
  status: "Present" | "Absent" | "Half-Day" | "Leave" | "Holiday";
  isLate: boolean;
  lopApplied: boolean;
  notes?: string;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    checkInLocation: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
    },
    checkOutLocation: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
    },
    totalHours: { type: Number },
    status: { type: String, enum: ["Present", "Absent", "Half-Day", "Leave", "Holiday"], default: "Absent" },
    isLate: { type: Boolean, default: false },
    lopApplied: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true }
);

AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);
