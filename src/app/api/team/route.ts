import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Team } from "@/models/Team";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    
    const team = await Team.findOne({ members: userId })
      .populate("members", "name email employeeId status department designation")
      .populate("managerId", "name email")
      .populate("updates.userId", "name");

    return NextResponse.json(team);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const userId = (session.user as any).id;

    const team = await Team.findOneAndUpdate(
      { $or: [{ members: userId }, { managerId: userId }] },
      { $push: { updates: { content: body.content, userId, timestamp: new Date() } } },
      { new: true }
    );

    return NextResponse.json(team);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
