import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Team } from "@/models/Team";
import { Leave } from "@/models/Leave";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const team = await Team.findOne({ $or: [{ members: userId }, { managerId: userId }] });
    if (!team) return NextResponse.json([]);

    const leaves = await Leave.find({ 
      userId: { $in: team.members },
      status: "Approved",
      startDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
    }).populate("userId", "name");

    return NextResponse.json(leaves);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
