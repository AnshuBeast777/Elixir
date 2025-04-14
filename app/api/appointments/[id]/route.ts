import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getUserFromToken } from "@/lib/authMiddleware";
import Appointment from "@/models/Appointment";

//  DELETE /api/appointments/:id
export async function DELETE(req: NextRequest, { params }: { params: { id?: string } }) {
  try {
    await dbConnect();

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    const user = getUserFromToken(token);

    if (!user || !user.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const appointmentId = params?.id?.trim();
    if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
      return NextResponse.json({ message: "Invalid appointment ID" }, { status: 400 });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
    }

    //  Only allow users to delete their own appointments (or add admin check)
    if (appointment.userId.toString() !== user.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await Appointment.findByIdAndDelete(appointmentId);

    return NextResponse.json({ message: "Appointment canceled successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

//  PUT /api/appointments/:id
export async function PUT(req: NextRequest, { params }: { params: { id?: string } }) {
  try {
    await dbConnect();

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    const user = getUserFromToken(token);

    if (!user || !user.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const appointmentId = params?.id?.trim();
    if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
      return NextResponse.json({ message: "Invalid appointment ID" }, { status: 400 });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
    }

    if (appointment.userId.toString() !== user.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { serviceId, stylistId, date, time } = await req.json();
    if (!serviceId || !stylistId || !date || !time) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    appointment.serviceId = new mongoose.Types.ObjectId(serviceId);
    appointment.stylistId = new mongoose.Types.ObjectId(stylistId);
    appointment.date = date;
    appointment.time = time;

    await appointment.save();

    return NextResponse.json({ message: "Appointment updated successfully", appointment }, { status: 200 });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
