import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { WorkUpdate } from "@/models/WorkUpdate";
import { User } from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== "Admin" && role !== "HR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();

    // Fetch all updates and populate employee details
    const updates = await WorkUpdate.find({})
      .sort({ createdAt: -1 })
      .populate("userId", "name employeeId email department avatar")
      .limit(100);

    return NextResponse.json({ updates });
  } catch (error: any) {
    console.error("Admin Work Updates Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
