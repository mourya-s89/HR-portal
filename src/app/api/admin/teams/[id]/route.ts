import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Team } from "@/models/Team";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role === "Employee") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const team = await Team.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(team);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role === "Employee") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await Team.findByIdAndDelete(id);
    return NextResponse.json({ message: "Team deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
