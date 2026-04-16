import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { HRDocument } from "@/models/Document";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = (session.user as any).role === "Employee" ? (session.user as any).id : searchParams.get("userId") || (session.user as any).id;
    const category = searchParams.get("category");
    const filter: any = { userId };
    if (category) filter.category = category;
    // Return only metadata, not file data
    const docs = await HRDocument.find(filter).select("-fileData").sort({ createdAt: -1 }).populate("uploadedBy","name role");
    return NextResponse.json({ documents: docs });
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
    const userId = (formData.get("userId") as string) || (session.user as any).id;
    const name = formData.get("name") as string || file.name;
    const category = formData.get("category") as string || "Other";
    const month = formData.get("month") ? parseInt(formData.get("month") as string) : undefined;
    const year = formData.get("year") ? parseInt(formData.get("year") as string) : undefined;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const doc = await HRDocument.create({
      userId,
      uploadedBy: (session.user as any).id,
      name,
      category,
      fileData: buffer,
      fileType: file.type,
      fileSize: buffer.byteLength,
      month,
      year,
    });

    const { fileData: _, ...docMeta } = doc.toObject();
    return NextResponse.json({ document: docMeta }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
