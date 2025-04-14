import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import Stylist from "@/models/Stylist";
import Service from "@/models/Service";
import { getUserFromToken } from "@/lib/authMiddleware";

// GET - Admin fetches all appointments
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "") || "";
    const user = getUserFromToken(token);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 403 });
    }

    const appointments = await Appointment.find()
      .populate("userId", "name email")
      .populate("stylistId", "name specialization")
      .populate("serviceId", "name price duration")
      .sort({ createdAt: -1 });

    const formatted = appointments.map((appt) => ({
      _id: appt._id.toString(),
      clientName: appt.userId?.name || "N/A",
      clientEmail: appt.userId?.email || "N/A",
      stylistName: appt.stylistId?.name || "N/A",
      stylistSpecialization: appt.stylistId?.specialization || "",
      serviceName: appt.serviceId?.name || "N/A",
      price: appt.serviceId?.price || 0,
      duration: appt.serviceId?.duration || 0,
      date: appt.date,
      time: appt.time,
      status: appt.status,
      isPaid: appt.isPaid,
      paymentMethod: appt.paymentMethod,
      paymentStatus: appt.paymentStatus,
      stripeSessionId: appt.stripeSessionId || "",
      createdAt: appt.createdAt,
    }));

    return NextResponse.json({ appointments: formatted });
  } catch (err) {
    console.error("Failed to fetch appointments:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST - Admin manually creates appointment
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "") || "";
    const user = getUserFromToken(token);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 403 });
    }

    const body = await req.json();
    const {
      userId,
      stylistId,
      serviceId,
      date,
      time,
      status,
      paymentMethod,
      paymentStatus,
      stripeSessionId,
    } = body;

    if (!userId || !stylistId || !serviceId || !date || !time) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const appointment = await Appointment.create({
      userId,
      stylistId,
      serviceId,
      date,
      time,
      status: status || "Scheduled",
      paymentMethod: paymentMethod || "in-person",
      paymentStatus: paymentStatus || "Pending",
      isPaid: paymentStatus === "Paid",
      stripeSessionId: stripeSessionId || "",
    });

    return NextResponse.json({
      message: "Appointment created!",
      appointment,
    });
  } catch (err) {
    console.error("Failed to create appointment:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
