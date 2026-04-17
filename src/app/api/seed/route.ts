import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import { Announcement } from "@/models/Announcement";
import { Policy } from "@/models/Policy";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectToDatabase();

    // Clear existing (optional - for fresh seed)
    // await User.deleteMany({});

    const hashedAdminPassword = await bcrypt.hash("Admin@123", 10);
    const hashedHrPassword = await bcrypt.hash("Hr@12345", 10);
    const hashedEmpPassword = await bcrypt.hash("Emp@1234", 10);

    const users = [
      {
        name: "Admin User",
        email: "admin@hrportal.com",
        password: hashedAdminPassword,
        role: "Admin",
        employeeId: "ADM001",
        department: "Management",
        designation: "System Administrator",
        status: "Active",
      },
      {
        name: "HR Manager",
        email: "hr@hrportal.com",
        password: hashedHrPassword,
        role: "HR",
        employeeId: "HR001",
        department: "Human Resources",
        designation: "HR Manager",
        status: "Active",
      },
      {
        name: "John Doe",
        email: "john@hrportal.com",
        password: hashedEmpPassword,
        role: "Employee",
        employeeId: "EMP101",
        department: "Engineering",
        designation: "Software Engineer",
        status: "Active",
      },
      {
        name: "Google Admin",
        email: "mouryakadali5@gmail.com",
        password: hashedAdminPassword,
        role: "Admin",
        employeeId: "ADM002",
        department: "Management",
        designation: "System Administrator",
        status: "Active",
      },
    ];

    for (const u of users) {
      await User.findOneAndUpdate({ email: u.email }, u, { upsert: true });
    }

    const admin = await User.findOne({ role: "Admin" });

    // Seed dummy announcement
    await Announcement.findOneAndUpdate(
      { title: "Welcome to HR Portal" },
      {
        title: "Welcome to HR Portal",
        content: "We are excited to launch our new HR system. Check out your dashboard for attendance and leaves.",
        priority: "General",
        pinned: true,
        postedBy: admin._id,
        targetRoles: ["Admin", "HR", "Employee"],
      },
      { upsert: true }
    );

    // Seed dummy policy
    await Policy.findOneAndUpdate(
      { title: "Work From Home Policy" },
      {
        title: "Work From Home Policy",
        category: "HR Policy",
        content: "Employees are eligible for 2 days of WFH per week with manager approval.",
        version: "1.1",
        effectiveDate: new Date(),
        isActive: true,
        postedBy: admin._id,
      },
      { upsert: true }
    );

    return NextResponse.json({
      message: "Database seeded successfully",
      accounts: [
        { email: "admin@hrportal.com", pass: "Admin@123", role: "Admin" },
        { email: "hr@hrportal.com", pass: "Hr@12345", role: "HR" },
        { email: "john@hrportal.com", pass: "Emp@1234", role: "Employee" },
      ],
    });
  } catch (error: any) {
    console.error("Seed Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
