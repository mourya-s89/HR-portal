import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { CalendarEvent } from "@/models/CalendarEvent";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    
    // Fetch all events for the year
    const events = await CalendarEvent.find()
      .populate("createdBy", "name")
      .sort({ date: 1 });

    return NextResponse.json({ events });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as any).role;
    if (role !== "Admin" && role !== "HR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectToDatabase();
    const body = await req.json();
    
    const event = await CalendarEvent.create({
      ...body,
      createdBy: (session.user as any).id
    });

    return NextResponse.json({ event });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await connectToDatabase();
    await CalendarEvent.findByIdAndDelete(id);

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
