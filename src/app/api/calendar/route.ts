import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { CalendarEvent } from "@/models/CalendarEvent";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const events = await CalendarEvent.find({ isPublic: true }).sort({ date: 1 }).populate("createdBy","name");
    return NextResponse.json({ events });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as any).role;
    if (role !== "Admin" && role !== "HR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const body = await req.json();
    const event = await CalendarEvent.create({ ...body, createdBy: (session.user as any).id });
    return NextResponse.json({ event }, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as any).role;
    if (role !== "Admin" && role !== "HR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectToDatabase();
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "Event ID is required" }, { status: 400 });

    const event = await CalendarEvent.findByIdAndUpdate(id, updates, { new: true });
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    return NextResponse.json({ event });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as any).role;
    if (role !== "Admin" && role !== "HR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Event ID is required" }, { status: 400 });

    const event = await CalendarEvent.findByIdAndDelete(id);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
