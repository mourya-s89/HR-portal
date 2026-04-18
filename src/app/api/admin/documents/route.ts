import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { HRDocument } from "@/models/Document";
import { User } from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as any).role;
    if (role !== "Admin" && role !== "HR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectToDatabase();
    
    // Fetch doc meta without the heavy Buffer data
    const documents = await HRDocument.find()
      .select("-fileData")
      .populate("userId", "name employeeId department")
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });

    const employees = await User.find({ role: "Employee" }).select("name employeeId department");

    return NextResponse.json({ documents, employees });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const formData = await req.formData();
    
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const category = formData.get("category") as string;
    const name = formData.get("name") as string;

    if (!file || !userId || !category || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const doc = await HRDocument.create({
      userId,
      uploadedBy: (session.user as any).id,
      name,
      category,
      fileData: buffer,
      fileType: file.type,
      fileSize: file.size,
      month: formData.get("month") ? parseInt(formData.get("month") as string) : undefined,
      year: formData.get("year") ? parseInt(formData.get("year") as string) : undefined,
    });

    return NextResponse.json({ message: "File uploaded", id: doc._id });
  } catch (error: any) {
    console.error("Upload error:", error);
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
    await HRDocument.findByIdAndDelete(id);

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
