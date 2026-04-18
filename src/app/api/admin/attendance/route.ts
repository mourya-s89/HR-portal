import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { User } from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as any).role;
    if (role !== "Admin" && role !== "HR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    
    // Default to today if no date provided
    const dateStr = searchParams.get("date");
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setHours(0, 0, 0, 0);

    // Fetch all active employees
    const employees = await User.find({ role: "Employee" }).select("name employeeId email department");

    // Fetch attendance for the specific date
    const records = await Attendance.find({ date }).populate("userId", "name employeeId department");

    return NextResponse.json({ employees, records });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as any).role;
    if (role !== "Admin" && role !== "HR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectToDatabase();
    const body = await req.json();
    const { id, userId, date, ...updates } = body;

    if (!userId || !date) {
      return NextResponse.json({ error: "User ID and date are required" }, { status: 400 });
    }

    // Normalize date to midnight
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const updatedRecord = await Attendance.findOneAndUpdate(
      id ? { _id: id } : { userId, date: normalizedDate },
      { 
        ...updates, 
        userId, 
        date: normalizedDate 
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    return NextResponse.json({ record: updatedRecord });
  } catch (error: any) {
    console.error("Attendance update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
