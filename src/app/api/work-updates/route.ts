import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { WorkUpdate } from "@/models/WorkUpdate";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = (session.user as any).role === "Employee" ? (session.user as any).id : searchParams.get("userId") || (session.user as any).id;
    const updates = await WorkUpdate.find({ userId }).sort({ date: -1 }).limit(30).populate("userId","name employeeId");
    return NextResponse.json({ updates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const { tasksCompleted, hoursSpent, blockers, nextDayPlan } = await req.json();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const update = await WorkUpdate.findOneAndUpdate(
      { userId: (session.user as any).id, date: today },
      { tasksCompleted, hoursSpent, blockers, nextDayPlan },
      { upsert: true, new: true }
    );
    return NextResponse.json({ message: "Work update saved", update }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
