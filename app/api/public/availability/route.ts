import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Appointment from "@/models/Appointment";

// PUBLIC: No token required
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const time = searchParams.get("time");

    if (!date || !time) {
      return NextResponse.json({ message: "Missing date or time" }, { status: 400 });
    }

    // Only get appointments for this date & time
    const appointments = await Appointment.find({ date, time });

    const bookedStylistIds = appointments.map((a) => a.stylistId?.toString());

    return NextResponse.json({ bookedStylistIds });
  } catch (err) {
    console.error("Availability check failed:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
