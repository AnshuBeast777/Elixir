import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Schedule from "@/models/Schedule";
import { getUserFromToken } from "@/lib/authMiddleware";

// GET schedules for a stylist (admin only)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const user = getUserFromToken(token || "");

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 403 });
    }

    const stylistId = req.nextUrl.searchParams.get("stylistId");
    if (!stylistId) {
      return NextResponse.json({ message: "Missing stylistId" }, { status: 400 });
    }

    const schedules = await Schedule.find({ stylistId });
    if (!schedules || schedules.length === 0) {
      return NextResponse.json({ message: "No schedules found for this stylist" }, { status: 404 });
    }

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ message: "Failed to fetch schedules" }, { status: 500 });
  }
}

// POST create a new schedule (admin only)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const user = getUserFromToken(token || "");

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 403 });
    }

    const { stylistId, dayOfWeek, startTime, endTime } = await req.json();

    if (!stylistId || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    if (startTime >= endTime) {
      return NextResponse.json({ message: "Start time must be before end time." }, { status: 400 });
    }

    //  Check for overlapping schedules (excluding the current one)
    const conflict = await Schedule.findOne({
      stylistId,
      dayOfWeek,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // check if new schedule overlaps with an existing one
      ],
    });

    if (conflict) {
      return NextResponse.json({ message: "Schedule overlaps with an existing one." }, { status: 409 });
    }

    const created = await Schedule.create({ stylistId, dayOfWeek, startTime, endTime });
    return NextResponse.json({ message: "Schedule created!", schedule: created });
  } catch (error: unknown) {
    // Cast the error to an instance of Error to access the 'message' property
    if (error instanceof Error) {
      console.error("Error creating schedule:", error.message);
      return NextResponse.json({ message: "Failed to create schedule", error: error.message }, { status: 500 });
    } else {
      console.error("Unknown error:", error);
      return NextResponse.json({ message: "Failed to create schedule", error: "Unknown error" }, { status: 500 });
    }
  }
}
