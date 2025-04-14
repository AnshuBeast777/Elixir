// app/api/admin/orders/[orderid]/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { getUserFromToken } from "@/lib/authMiddleware";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export async function DELETE(req: NextRequest, { params }: { params: { orderid: string } }) {
  try {
    await dbConnect();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const user = getUserFromToken(token || "");

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 403 });
    }

    const order = await Order.findById(params.orderid);

    if (!order) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    // If already refunded or pending, just delete
    if (order.paymentStatus === "Pending") {
      await Order.findByIdAndDelete(params.orderid);
      return NextResponse.json({ message: "Pending order deleted." });
    }

    // If already refunded
    if (order.paymentStatus === "Refunded") {
      return NextResponse.json({ message: "Already refunded." });
    }

    // Attempt Stripe refund
    try {
      await stripe.refunds.create({
        payment_intent: order.stripeSessionId,
      });

      order.paymentStatus = "Refunded";
      await order.save();

      return NextResponse.json({ message: "Refund successful. Order marked as Refunded." });
    } catch (err) {
      console.error("Stripe refund failed:", err);
      return NextResponse.json({ message: "Refund failed via Stripe." }, { status: 500 });
    }
  } catch (error) {
    console.error("Failed to cancel/refund order:", error);
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}
