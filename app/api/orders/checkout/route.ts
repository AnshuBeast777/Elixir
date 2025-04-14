import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { getUserFromToken } from "@/lib/authMiddleware";

export async function POST(req: Request) {
  console.log("Received request at /api/orders/checkout");

  try {
    await dbConnect();

    // Extract and verify token
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      console.error("Unauthorized: No token");
      return NextResponse.json({ message: "Unauthorized: No token" }, { status: 401 });
    }

    const user = getUserFromToken(token);
    if (!user?.userId) {
      console.error("Invalid token or missing userId");
      return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 });
    }

    // Parse request body
    const { cart, totalAmount, sessionId } = await req.json();

    if (!cart || !Array.isArray(cart) || cart.length === 0 || !sessionId) {
      console.error("Missing cart or sessionId:", { cart, sessionId });
      return NextResponse.json({ message: "Missing cart or sessionId" }, { status: 400 });
    }

    // Save Order in MongoDB
    const newOrder = new Order({
      userId: user.userId,
      stripeSessionId: sessionId,
      products: cart.map((item: any) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount,
      paymentStatus: "Pending",
    });

    await newOrder.save();

    console.log("Order saved to DB:", newOrder._id);

    return NextResponse.json(
      { message: "Order saved successfully", order: newOrder },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Order Save Error:", error);
    return NextResponse.json(
      {
        message: "Server error while saving order",
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
