import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Feedback } from "@/models/Feedback";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const role = (session.user as any).role;
    const filter = role === "Employee" ? { fromUser: (session.user as any).id } : {};
    const feedbacks = await Feedback.find(filter).sort({ createdAt: -1 }).populate("fromUser","name").populate("toUser","name");
    return NextResponse.json({ feedbacks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const body = await req.json();
    const feedback = await Feedback.create({ ...body, fromUser: (session.user as any).id });
    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
