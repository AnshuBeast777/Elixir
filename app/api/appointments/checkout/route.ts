// File: /app/api/appointments/checkout/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Service from "@/models/Service";
import { getUserFromToken } from "@/lib/authMiddleware";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    const user = getUserFromToken(token);

    if (!user || !user.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { serviceId, stylistId, date, time } = await req.json();
    if (!serviceId || !stylistId || !date || !time) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch selected service details
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    // Create appointment (fix casing for enum)
    const appointment = await Appointment.create({
      userId: user.userId,
      serviceId,
      stylistId,
      date,
      time,
      status: "Scheduled",
      paymentMethod: "online", //  lowercase to match schema
      isPaid: false,
      paymentStatus: "Pending",
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Appointment - ${service.name}`,
            },
            unit_amount: service.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/appointment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/appointments`,
      metadata: {
        type: "appointment",
        appointmentId: appointment._id.toString(),
        userId: user.userId,
      },
    });

    appointment.stripeSessionId = session.id;
    await appointment.save();

    return NextResponse.json({ sessionUrl: session.url });
  } catch (err: any) {
    console.error("Stripe appointment error:", err.message);
    return NextResponse.json(
      { message: "Stripe session failed", error: err.message },
      { status: 500 }
    );
  }
}
