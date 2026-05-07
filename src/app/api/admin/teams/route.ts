import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Team } from "@/models/Team";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role === "Employee") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teams = await Team.find()
      .populate("members", "name email employeeId status department designation")
      .populate("managerId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(teams);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role === "Employee") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const team = await Team.create({
      ...body,
      managerId: (session.user as any).id,
    });

    return NextResponse.json(team);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
