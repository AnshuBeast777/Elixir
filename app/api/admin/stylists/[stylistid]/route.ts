import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Stylist from "@/models/Stylist";
import { getUserFromToken } from "@/lib/authMiddleware";

// UPDATE stylist (PUT)
export async function PUT(req: NextRequest, { params }: { params: { stylistid: string } }) {
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

    const updated = await Stylist.findByIdAndUpdate(
      params.stylistid,
      { name, bio, specialization },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Stylist not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Stylist updated!", stylist: updated });
  } catch (error) {
    console.error("Error updating stylist:", error);
    return NextResponse.json({ message: "Failed to update stylist" }, { status: 500 });
  }
}

// DELETE stylist
export async function DELETE(req: NextRequest, { params }: { params: { stylistid: string } }) {
  try {
    await dbConnect();
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const user = getUserFromToken(token || "");

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 403 });
    }

    const deleted = await Stylist.findByIdAndDelete(params.stylistid);

    if (!deleted) {
      return NextResponse.json({ message: "Stylist not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Stylist deleted." });
  } catch (error) {
    console.error("Error deleting stylist:", error);
    return NextResponse.json({ message: "Failed to delete stylist" }, { status: 500 });
  }
}
