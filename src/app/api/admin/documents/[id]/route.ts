import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { HRDocument } from "@/models/Document";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    await connectToDatabase();
    const doc = await HRDocument.findById((await params).id);
    if (!doc) return new Response("Not Found", { status: 404 });

    // Return the buffer data with correct headers
    return new Response(doc.fileData, {
      headers: {
        "Content-Type": doc.fileType,
        "Content-Disposition": `inline; filename="${doc.name}"`,
      },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
