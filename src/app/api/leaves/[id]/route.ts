import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Leave } from "@/models/Leave";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as any).role;
    if (role !== "Admin" && role !== "HR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await connectToDatabase();
    const { id } = await params;
    const { action, rejectionReason } = await req.json();
    const status = action === "approve" ? "Approved" : "Rejected";
    const leave = await Leave.findByIdAndUpdate(id, {
      status, approvedBy: (session.user as any).id, approvedAt: new Date(),
      ...(status === "Rejected" && { rejectionReason }),
    }, { new: true });
    return NextResponse.json({ message: `Leave ${status}`, leave });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}