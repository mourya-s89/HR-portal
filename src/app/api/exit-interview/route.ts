import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { ExitInterview } from "@/models/ExitInterview";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const role = (session.user as any).role;
    const filter = role === "Employee" ? { userId: (session.user as any).id } : {};
    const interviews = await ExitInterview.find(filter).sort({ createdAt: -1 }).populate("userId","name employeeId department");
    return NextResponse.json({ interviews });
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
    const interview = await ExitInterview.findOneAndUpdate(
      { userId: (session.user as any).id },
      { ...body, userId: (session.user as any).id },
      { upsert: true, new: true }
    );
    return NextResponse.json({ interview }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
