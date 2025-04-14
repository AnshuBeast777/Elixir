import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/authMiddleware";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export async function DELETE(req: Request, { params }: { params: { orderId: string } }) {
  try {
    await dbConnect();

    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized: No token or invalid token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1]?.trim();
    if (!token) {
      return NextResponse.json({ message: "Unauthorized: Token is empty" }, { status: 401 });
    }

    const user = getUserFromToken(token);
    if (!user?.userId) {
      return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 });
    }

    const orderId = params?.orderId;
    if (!orderId) {
      return NextResponse.json({ message: "Bad Request: Missing order ID" }, { status: 400 });
    }

    const order = await Order.findOne({ _id: orderId, userId: user.userId });
    if (!order) {
      return NextResponse.json({ message: "Order not found or not authorized" }, { status: 404 });
    }

    if (order.paymentStatus === "Refunded") {
      return NextResponse.json({ message: "Order is already refunded." }, { status: 400 });
    }

    //If Paid, issue refund using payment_intent
    if (order.paymentStatus === "Paid") {
      if (!order.stripeSessionId) {
        return NextResponse.json({ message: "Missing Stripe session ID for refund." }, { status: 400 });
      }

      try {
        //  Get session from Stripe
        const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);

        //  Get payment_intent from session
        const paymentIntent = session.payment_intent as string;

        //  Create refund using correct payment_intent
        const refund = await stripe.refunds.create({
          payment_intent: paymentIntent,
        });

        order.paymentStatus = "Refunded";
        await order.save();

        console.log(` User ${user.userId} refunded order ${orderId}, refund ID: ${refund.id}`);
        return NextResponse.json({ message: "Refund processed. Order marked as Refunded." }, { status: 200 });
      } catch (err) {
        console.error("Stripe refund failed:", err);
        return NextResponse.json({ message: "Refund failed. Please try again later." }, { status: 500 });
      }
    }

    // 🗑 If Pending, delete the order
    if (order.paymentStatus === "Pending") {
      await Order.findByIdAndDelete(order._id);
      console.log(`User ${user.userId} canceled and deleted order ${orderId}`);
      return NextResponse.json({ message: "Order canceled successfully." }, { status: 200 });
    }

    return NextResponse.json({ message: "Unsupported operation." }, { status: 400 });

  } catch (error) {
    console.error("Error canceling/refunding order:", error);
    return NextResponse.json(
      { message: "Server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
