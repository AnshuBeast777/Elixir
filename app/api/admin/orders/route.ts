// app/api/admin/orders/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { getUserFromToken } from "@/lib/authMiddleware";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const user = getUserFromToken(token || "");

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 403 });
    }

    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}
