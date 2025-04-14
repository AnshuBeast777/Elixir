import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ message: "No session ID provided." }, { status: 400 });
    }

    console.log("Searching for order with session ID:", sessionId);

    const order = await Order.findOne({ stripeSessionId: sessionId });

    if (!order) {
      console.log("No order found for session ID:", sessionId);
      return NextResponse.json({ message: "Order not found for this session." }, { status: 404 });
    }

    // Update payment status to Paid if it's still Pending
    if (order.paymentStatus === "Pending") {
      order.paymentStatus = "Paid";
      await order.save();
      console.log("Updated order payment status to Paid");
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { message: "Server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
