import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { getUserFromToken } from "@/lib/authMiddleware";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const user = getUserFromToken(token || "");

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 403 });
    }

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalOrders = await Order.countDocuments();
    const totalClients = await User.countDocuments({ role: "client" });
    const totalProducts = await Product.countDocuments();

    return NextResponse.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      totalClients,
      totalProducts,
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json({ message: "Failed to fetch analytics" }, { status: 500 });
  }
}
