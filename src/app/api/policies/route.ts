import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Policy } from "@/models/Policy";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const policies = await Policy.find({ isActive: true }).sort({ createdAt: -1 }).populate("postedBy","name role");
    return NextResponse.json({ policies });
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
    const policy = await Policy.create({ ...body, postedBy: (session.user as any).id });
    return NextResponse.json({ policy }, { status: 201 });
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
    if (!id) return NextResponse.json({ error: "Policy ID is required" }, { status: 400 });

    const policy = await Policy.findByIdAndUpdate(id, updates, { new: true });
    if (!policy) return NextResponse.json({ error: "Policy not found" }, { status: 404 });

    return NextResponse.json({ policy });
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
    if (!id) return NextResponse.json({ error: "Policy ID is required" }, { status: 400 });

    const policy = await Policy.findByIdAndDelete(id);
    if (!policy) return NextResponse.json({ error: "Policy not found" }, { status: 404 });

    return NextResponse.json({ message: "Policy deleted successfully" });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
