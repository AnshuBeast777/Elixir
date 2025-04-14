import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Stylist from "@/models/Stylist";
import { getUserFromToken } from "@/lib/authMiddleware";

// GET all stylists (admin only)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const user = getUserFromToken(token || "");

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 403 });
    }

    const stylists = await Stylist.find().sort({ createdAt: -1 });
    return NextResponse.json({ stylists });
  } catch (error) {
    console.error("Error fetching stylists:", error);
    return NextResponse.json({ message: "Failed to fetch stylists" }, { status: 500 });
  }
}

// POST a new stylist (admin only)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const user = getUserFromToken(token || "");

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 403 });
    }

    const { name, bio, specialization } = await req.json();

    if (!name) {
      return NextResponse.json({ message: "Name is required." }, { status: 400 });
    }

    const stylist = await Stylist.create({ name, bio, specialization });
    return NextResponse.json({ message: "Stylist created!", stylist });
  } catch (error) {
    console.error("Error creating stylist:", error);
    return NextResponse.json({ message: "Failed to create stylist" }, { status: 500 });
  }
}
