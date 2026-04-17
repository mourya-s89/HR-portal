import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import { Attendance } from "@/models/Attendance";
import { Leave } from "@/models/Leave";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as any).role;
    if (role !== "Admin" && role !== "HR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await connectToDatabase();

    const today = new Date(); today.setHours(0,0,0,0);
    const totalEmployees = await User.countDocuments({ role: "Employee", status: "Active" });
    const presentToday = await Attendance.countDocuments({ date: today, status: "Present" });
    const onLeave = await Attendance.countDocuments({ date: today, status: "Leave" });
    const lateToday = await Attendance.countDocuments({ date: today, isLate: true });
    const pendingLeaves = await Leave.countDocuments({ status: "Pending" });

    // Role Distribution
    const adminCount = await User.countDocuments({ role: "Admin" });
    const hrCount = await User.countDocuments({ role: "HR" });
    const employeeCount = await User.countDocuments({ role: "Employee" });

    // Department-wise attendance for chart
    const deptStats = await Attendance.aggregate([
      { $match: { date: today } },
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $group: { _id: "$user.department", present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } }, total: { $sum: 1 } } },
    ]);

    return NextResponse.json({ 
      totalEmployees, 
      presentToday, 
      onLeave, 
      lateToday, 
      pendingLeaves, 
      deptStats,
      adminCount,
      hrCount,
      employeeCount
    });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
