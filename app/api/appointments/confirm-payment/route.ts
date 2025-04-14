import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Appointment from "@/models/Appointment";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { sessionId } = await req.json();

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { message: "Missing or invalid Stripe session ID" },
        { status: 400 }
      );
    }

    // Look up appointment by Stripe session ID
    const appointment = await Appointment.findOne({ stripeSessionId: sessionId });

    if (!appointment) {
      return NextResponse.json(
        { message: "No appointment found for this session ID" },
        { status: 404 }
      );
    }

    // If already paid, return success (no error)
    if (appointment.isPaid && appointment.paymentStatus === "Paid") {
      return NextResponse.json({ message: "Already confirmed." }, { status: 200 });
    }

    // Otherwise, mark as paid
    appointment.isPaid = true;
    appointment.paymentStatus = "Paid";
    await appointment.save();

    return NextResponse.json({ message: "Payment successfully confirmed." }, { status: 200 });
  } catch (err: any) {
    console.error("Appointment payment confirmation error:", err.message);
    return NextResponse.json(
      { message: "Internal server error", error: err.message },
      { status: 500 }
    );
  }
}
