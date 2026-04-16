import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Performance } from "@/models/Performance";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = (session.user as any).role === "Employee" ? (session.user as any).id : searchParams.get("userId") || (session.user as any).id;
    const records = await Performance.find({ userId }).sort({ year: -1, month: -1 }).populate("reviewedBy","name");
    return NextResponse.json({ records });
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
    const record = await Performance.findOneAndUpdate(
      { userId: body.userId || (session.user as any).id, month: body.month, year: body.year },
      { ...body, reviewedBy: (session.user as any).id },
      { upsert: true, new: true }
    );
    return NextResponse.json({ record }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
