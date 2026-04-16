import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { getWorkingHours } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { location } = await req.json();
    await connectToDatabase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ userId: (session.user as any).id, date: today });
    if (!attendance || !attendance.checkIn) {
      return NextResponse.json({ error: "Missing check-in for today" }, { status: 400 });
    }

    if (attendance.checkOut) {
      return NextResponse.json({ error: "Already checked out today" }, { status: 400 });
    }

    const checkOut = new Date();
    const totalHours = getWorkingHours(attendance.checkIn, checkOut);

    attendance.checkOut = checkOut;
    attendance.checkOutLocation = location;
    attendance.totalHours = totalHours;
    await attendance.save();

    return NextResponse.json({ message: "Checked out successfully", attendance });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
