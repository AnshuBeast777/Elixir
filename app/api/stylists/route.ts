import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Stylist from "@/models/Stylist";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const stylists = await Stylist.find().sort({ createdAt: -1 });
    
    if (!stylists || stylists.length === 0) {
      return NextResponse.json({ message: "No stylists found", stylists: [] }, { status: 200 });
    }

    return NextResponse.json({ stylists }, { status: 200 });
  } catch (error) {
    console.error("Error fetching stylists:", error);
    return NextResponse.json({ message: "Server error while fetching stylists" }, { status: 500 });
  }
}
