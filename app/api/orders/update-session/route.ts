import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { getUserFromToken } from "@/lib/authMiddleware";

export async function PATCH(req: Request) {
  try {
    await dbConnect();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "").trim();
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = getUserFromToken(token);
    if (!user?.userId) return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    const { orderId, newSessionId, newSessionUrl } = await req.json();

    if (!orderId || !newSessionId) {
      return NextResponse.json({ message: "Missing session ID or order ID" }, { status: 400 });
    }

    const updateData: any = {
      stripeSessionId: newSessionId,
    };

    if (newSessionUrl) {
      updateData.stripeRedirectUrl = newSessionUrl;
    }

    const updated = await Order.findOneAndUpdate(
      { _id: orderId, userId: user.userId },
      updateData,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Order not found or update failed" }, { status: 404 });
    }

    return NextResponse.json({ message: "Session updated", order: updated });
  } catch (error: any) {
    console.error("Error updating session:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
