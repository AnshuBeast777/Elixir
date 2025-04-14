import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { getUserFromToken } from "@/lib/authMiddleware";
import mongoose from "mongoose";

export async function PUT(req: NextRequest, { params }: { params: { appointmentid: string } }) {
  try {
    await dbConnect();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const user = getUserFromToken(token || "");

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "⛘ Unauthorized. Admins only." }, { status: 403 });
    }

    const { appointmentid } = params;

    if (!mongoose.Types.ObjectId.isValid(appointmentid)) {
      return NextResponse.json({ message: "Invalid appointment ID." }, { status: 400 });
    }

    const { status, date, time } = await req.json();

    const updated = await Appointment.findByIdAndUpdate(
      appointmentid,
      { status, date, time },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Appointment not found." }, { status: 404 });
    }

    console.log(`✏️ Admin ${user.userId} updated appointment ${appointmentid}`);
    return NextResponse.json({ message: "Appointment updated!", appointment: updated });
  } catch (err: any) {
    console.error("Update error:", err.message);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { appointmentid: string } }) {
  try {
    await dbConnect();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const user = getUserFromToken(token || "");

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 403 });
    }

    const { appointmentid } = params;

    if (!mongoose.Types.ObjectId.isValid(appointmentid)) {
      return NextResponse.json({ message: "Invalid appointment ID." }, { status: 400 });
    }

    const deleted = await Appointment.findByIdAndDelete(appointmentid);

    if (!deleted) {
      return NextResponse.json({ message: "Appointment not found." }, { status: 404 });
    }

    console.log(`Admin ${user.userId} deleted appointment ${appointmentid}`);
    return NextResponse.json({ message: "Appointment deleted!" });
  } catch (err: any) {
    console.error("Delete error:", err.message);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}
