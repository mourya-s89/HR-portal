import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Leave } from "@/models/Leave";
import { getDateRange } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = (session.user as any).role === "Employee" ? (session.user as any).id : searchParams.get("userId") || (session.user as any).id;
    const leaves = await Leave.find({ userId }).sort({ createdAt: -1 }).populate("userId", "name employeeId department");
    // CL balance: 1 per year, check approved CLs this year
    const year = new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const approvedCLs = await Leave.countDocuments({ userId, type: "CL", status: "Approved", createdAt: { $gte: startOfYear } });
    const clBalance = Math.max(0, 1 - approvedCLs);
    return NextResponse.json({ leaves, clBalance });
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
    const { type, startDate, endDate, reason } = body;
    const days = getDateRange(new Date(startDate), new Date(endDate));
    // Determine if LOP
    let isLOP = false;
    if (type === "CL") {
      const year = new Date().getFullYear();
      const startOfYear = new Date(year, 0, 1);
      const existingCL = await Leave.countDocuments({ userId: (session.user as any).id, type: "CL", status: "Approved", createdAt: { $gte: startOfYear } });
      if (existingCL >= 1) isLOP = true;
    }
    const leave = await Leave.create({
      userId: (session.user as any).id,
      type: isLOP ? "LOP" : type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      days,
      reason,
      isLOP,
      status: "Pending",
    });
    return NextResponse.json({ message: "Leave applied successfully", leave }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
