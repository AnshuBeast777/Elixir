// File: app/api/webhooks/stripe/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Appointment from "@/models/Appointment";

// Stripe Init
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

// Helper to convert ReadableStream to Buffer
async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

// Webhook Handler
export async function POST(req: Request) {
  try {
    const rawBody = await buffer(req.body!);
    const signature = req.headers.get("stripe-signature");

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("Missing Stripe signature or webhook secret");
      return new NextResponse("Unauthorized", { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error("Stripe signature verification failed:", err.message);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log(`Stripe Event Received: ${event.type}`);
    await dbConnect();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const type = session.metadata?.type;

      if (type === "order") {
        const order = await Order.findOneAndUpdate(
          { stripeSessionId: session.id },
          { paymentStatus: "Paid" },
          { new: true }
        );

        if (order) {
          console.log(`Order ${order._id} marked as PAID`);
        } else {
          console.warn(`No order found for session ${session.id}`);
        }
      } else if (type === "appointment") {
        const appointmentId = session.metadata?.appointmentId;

        if (!appointmentId) {
          console.warn(`Missing appointmentId in metadata for session ${session.id}`);
          return new NextResponse("Missing appointmentId", { status: 400 });
        }

        const appointment = await Appointment.findByIdAndUpdate(
          appointmentId,
          {
            isPaid: true,
            paymentStatus: "Paid",
            stripeSessionId: session.id,
          },
          { new: true }
        );

        if (appointment) {
          console.log(`Appointment ${appointment._id} marked as PAID`);
        } else {
          console.warn(`No appointment found for session ${session.id}`);
        }
      } else {
        console.warn(`Unknown metadata.type: ${type}`);
      }
    }

    return new NextResponse("Webhook handled", { status: 200 });
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    return new NextResponse("Server error", { status: 500 });
  }
}