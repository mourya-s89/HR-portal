import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { HRDocument } from "@/models/Document";
import { User } from "@/models/User";
import { Team } from "@/models/Team";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const role = (session.user as any).role;
    const userIdVal = (session.user as any).id;
    const userIdParam = searchParams.get("userId");
    
    let filter: any = {};
    if (role === "Employee") {
      filter = {
        $or: [
          { userId: userIdVal },
          { sharedWith: userIdVal }
        ]
      };
    } else if (userIdParam) {
      filter.userId = userIdParam;
    } else {
      // Admin/HR viewing their own docs + shared
      filter = {
        $or: [
          { userId: userIdVal },
          { sharedWith: userIdVal }
        ]
      };
    }

    const category = searchParams.get("category");
    if (category && category !== "All") filter.category = category;

    const docs = await HRDocument.find(filter)
      .select("-fileData")
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name role")
      .populate("userId", "name"); // Owner name

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
    
    // Sharing Logic
    const shareMode = formData.get("shareMode") as string; // "Personal", "HR", "Team", "Specific"
    const specificIds = formData.get("sharedWith") ? (formData.get("sharedWith") as string).split(',') : [];
    
    let sharedWith: string[] = [];

    if (shareMode === "HR") {
      const hrUsers = await User.find({ role: { $in: ["Admin", "HR"] } }).select("_id");
      sharedWith = hrUsers.map(u => u._id.toString());
    } else if (shareMode === "Team") {
      const team = await Team.findOne({ members: session.user.id });
      if (team) {
        sharedWith = [...team.members.map(m => m.toString()), team.managerId.toString()];
      }
    } else if (shareMode === "Specific") {
      sharedWith = specificIds;
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const doc = await HRDocument.create({
      userId,
      uploadedBy: (session.user as any).id,
      sharedWith: Array.from(new Set(sharedWith)), // Unique IDs
      name,
      category,
      fileData: buffer,
      fileType: file.type,
      fileSize: buffer.byteLength,
    });

    const { fileData: _, ...docMeta } = doc.toObject();
    return NextResponse.json({ document: docMeta }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
