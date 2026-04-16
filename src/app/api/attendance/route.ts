import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Attendance } from "@/models/Attendance";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || (session.user as any).id;
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : new Date().getMonth() + 1;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : new Date().getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    const records = await Attendance.find({ userId, date: { $gte: start, $lte: end } }).sort({ date: 1 });
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const today = await Attendance.findOne({ userId, date: todayStart });
    return NextResponse.json({ records, today });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
