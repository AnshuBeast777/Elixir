import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Schedule from "@/models/Schedule";
import { getUserFromToken } from "@/lib/authMiddleware";
import mongoose from "mongoose";

// ✅ PUT: Update a schedule
export async function PUT(req: NextRequest, { params }: { params: { scheduleid: string } }) {
  try {
    await dbConnect();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const user = getUserFromToken(token || "");

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 403 });
    }

    const { scheduleid } = params;
    if (!mongoose.Types.ObjectId.isValid(scheduleid)) {
      return NextResponse.json({ message: "Invalid schedule ID" }, { status: 400 });
    }

    const { dayOfWeek, startTime, endTime } = await req.json();
    if (!dayOfWeek || !startTime || !endTime) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    if (startTime >= endTime) {
      return NextResponse.json({ message: "Start time must be before end time" }, { status: 400 });
    }

    const current = await Schedule.findById(scheduleid);
    if (!current) {
      return NextResponse.json({ message: "Schedule not found" }, { status: 404 });
    }

    // Check for overlapping schedules for the same stylist and day
    const conflict = await Schedule.findOne({
      _id: { $ne: scheduleid }, // Exclude current schedule
      stylistId: current.stylistId,
      dayOfWeek,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } } // check overlap
      ]
    });

    if (conflict) {
      return NextResponse.json({
        message: "Stylist already has a schedule for this day.",
      }, { status: 409 });
    }

    // Update schedule
    const updated = await Schedule.findByIdAndUpdate(
      scheduleid,
      { dayOfWeek, startTime, endTime },
      { new: true }
    );

    return NextResponse.json({
      message: "Schedule updated successfully!",
      schedule: updated,
    });
  } catch (err: any) {
    console.error("PUT error:", err.message);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}

//  DELETE: Remove a schedule
export async function DELETE(req: NextRequest, { params }: { params: { scheduleid: string } }) {
  try {
    await dbConnect();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const user = getUserFromToken(token || "");

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 403 });
    }

    const { scheduleid } = params;
    if (!mongoose.Types.ObjectId.isValid(scheduleid)) {
      return NextResponse.json({ message: "Invalid schedule ID" }, { status: 400 });
    }

    const deleted = await Schedule.findByIdAndDelete(scheduleid);
    if (!deleted) {
      return NextResponse.json({ message: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Schedule deleted successfully!" });
  } catch (err: any) {
    console.error("DELETE error:", err.message);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}
