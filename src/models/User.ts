import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "Admin" | "HR" | "Employee";
  employeeId: string;
  department: string;
  designation: string;
  phone?: string;
  avatar?: string;
  status: "Active" | "Inactive" | "Resigned";
  joiningDate: Date;
  managerId?: mongoose.Types.ObjectId;
  address?: string;
  emergencyContact?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    role: { type: String, enum: ["Admin", "HR", "Employee"], default: "Employee" },
    employeeId: { type: String, unique: true, sparse: true },
    department: { type: String, default: "General" },
    designation: { type: String, default: "Employee" },
    phone: { type: String },
    avatar: { type: String },
    status: { type: String, enum: ["Active", "Inactive", "Resigned"], default: "Active" },
    joiningDate: { type: Date, default: Date.now },
    managerId: { type: Schema.Types.ObjectId, ref: "User" },
    address: { type: String },
    emergencyContact: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
