import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { HRDocument } from "@/models/Document";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const { id } = await params;
    const doc = await HRDocument.findById(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new NextResponse(doc.fileData as any, {
      headers: {
        "Content-Type": doc.fileType,
        "Content-Disposition": `attachment; filename="${doc.name}"`,
      },
    });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const { id } = await params;
    await HRDocument.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}