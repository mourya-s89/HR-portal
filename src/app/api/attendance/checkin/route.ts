import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { isLateCheckIn } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { location } = await req.json();
    await connectToDatabase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({ userId: (session.user as any).id, date: today });
    if (existing?.checkIn) return NextResponse.json({ error: "Already checked in today" }, { status: 400 });

    const isLate = isLateCheckIn(new Date());

    const attendance = await Attendance.findOneAndUpdate(
      { userId: (session.user as any).id, date: today },
      {
        checkIn: new Date(),
        checkInLocation: location,
        status: "Present",
        isLate,
        // If late, mark for possible LOP (half day) per user requirement
        lopApplied: isLate, 
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "Checked in successfully", attendance });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
