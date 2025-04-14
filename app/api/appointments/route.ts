import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Service from "@/models/Service";
import Stylist from "@/models/Stylist";
import User from "@/models/User";
import { getUserFromToken } from "@/lib/authMiddleware";
import mongoose from "mongoose";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

// POST - Book an appointment (User Side)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "") || "";
    const user = getUserFromToken(token);

    if (!user || !user.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { serviceId, stylistId, date, time, paymentMethod } = await req.json();
    if (!serviceId || !stylistId || !date || !time || !paymentMethod) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json({ message: "Invalid service" }, { status: 400 });
    }

    // If in-person payment, no Stripe session needed
    if (paymentMethod === "in-person") {
      const appointment = await Appointment.create({
        userId: user.userId,
        stylistId,
        serviceId,
        date,
        time,
        status: "Scheduled",
        paymentMethod: "in-person",
        paymentStatus: "Pending",
        isPaid: false,
      });

      return NextResponse.json({ message: "Appointment booked!", appointment });
    }

    //If online payment, create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
      metadata: {
        userId: user.userId,
        stylistId,
        serviceId,
        date,
        time,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: service.name,
            },
            unit_amount: Math.round(service.price * 100),
          },
          quantity: 1,
        },
      ],
    });

    //Save as pending, will update via webhook
    const appointment = await Appointment.create({
      userId: user.userId,
      stylistId,
      serviceId,
      date,
      time,
      status: "Scheduled",
      paymentMethod: "online",
      paymentStatus: "Pending",
      isPaid: false,
      stripeSessionId: session.id,
    });

    return NextResponse.json({ message: "Stripe session created", url: session.url });
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

//GET - Admin fetches all appointments
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "") || "";
    const user = getUserFromToken(token);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized: Admins only" }, { status: 403 });
    }

    const appointments = await Appointment.find()
      .populate("userId", "name email")
      .populate("stylistId", "name specialization")
      .populate("serviceId", "name price duration")
      .sort({ createdAt: -1 });

    const formatted = appointments.map((appt) => ({
      _id: appt._id.toString(),
      clientName: appt.userId?.name || "Unknown",
      clientEmail: appt.userId?.email || "N/A",
      stylistName: appt.stylistId?.name || "Unknown",
      specialization: appt.stylistId?.specialization || "",
      serviceName: appt.serviceId?.name || "Unknown",
      servicePrice: appt.serviceId?.price || 0,
      serviceDuration: appt.serviceId?.duration || 0,
      date: appt.date,
      time: appt.time,
      status: appt.status,
      isPaid: appt.isPaid,
      paymentMethod: appt.paymentMethod,
      paymentStatus: appt.paymentStatus,
      stripeSessionId: appt.stripeSessionId || "",
    }));

    return NextResponse.json({ appointments: formatted });
  } catch (err) {
    console.error("Error fetching appointments:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
