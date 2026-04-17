import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { SOP } from "@/models/SOP";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const dept = searchParams.get("department");
    const filter: any = { isActive: true };
    if (dept) filter.department = dept;
    const sops = await SOP.find(filter).sort({ createdAt: -1 }).populate("postedBy","name role");
    return NextResponse.json({ sops });
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
    const sop = await SOP.create({ ...body, postedBy: (session.user as any).id });
    return NextResponse.json({ sop }, { status: 201 });
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
    if (!id) return NextResponse.json({ error: "SOP ID is required" }, { status: 400 });

    const sop = await SOP.findByIdAndUpdate(id, updates, { new: true });
    if (!sop) return NextResponse.json({ error: "SOP not found" }, { status: 404 });

    return NextResponse.json({ sop });
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
    if (!id) return NextResponse.json({ error: "SOP ID is required" }, { status: 400 });

    const sop = await SOP.findByIdAndDelete(id);
    if (!sop) return NextResponse.json({ error: "SOP not found" }, { status: 404 });

    return NextResponse.json({ message: "SOP deleted successfully" });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
