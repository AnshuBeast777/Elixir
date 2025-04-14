import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Service from "@/models/Service"; // REQUIRED IMPORT
import Stylist from "@/models/Stylist"; // REQUIRED IMPORT
import { getUserFromToken } from "@/lib/authMiddleware";

// GET /api/user/appointments - for client dashboard
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    const user = getUserFromToken(token);

    if (!user || !user.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const appointments = await Appointment.find({ userId: user.userId })
      .populate({ path: "serviceId", model: Service, select: "name price duration" })
      .populate({ path: "stylistId", model: Stylist, select: "name specialization" });

    const formatted = appointments.map((appt) => ({
      _id: appt._id.toString(),
      service: appt.serviceId?.name || "N/A",
      stylist: appt.stylistId?.name || "N/A",
      date: appt.date,
      time: appt.time,
      status: appt.status,
    }));

    return NextResponse.json({ appointments: formatted });
  } catch (err) {
    console.error("Error fetching user appointments:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}