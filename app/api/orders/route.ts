import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/authMiddleware";

export async function GET(req: Request) {
  try {
    await dbConnect();
    console.log("Connected to MongoDB");

    // Extract token from headers
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Unauthorized: Missing or invalid token format");
      return NextResponse.json({ message: "Unauthorized: Missing or invalid token format" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1]?.trim();
    console.log("Received Token:", token);

    if (!token) {
      console.error("Unauthorized: Token is empty");
      return NextResponse.json({ message: "Unauthorized: Token is empty" }, { status: 401 });
    }

    // Validate Token
    const user = getUserFromToken(token);
    if (!user || !user.userId) {
      console.error("Unauthorized: Invalid or expired token");
      return NextResponse.json({ message: "Unauthorized: Invalid or expired token" }, { status: 401 });
    }

    console.log(`Fetching orders for user: ${user.userId}`);

    // Fetch orders for the authenticated user
    const orders = await Order.find({ userId: user.userId }).lean();

    console.log(`Orders fetched: ${orders.length} orders for user ${user.userId}`);

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    console.log("Connected to MongoDB");

    // Extract token from headers
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Unauthorized: Missing or invalid token format");
      return NextResponse.json({ message: "Unauthorized: Missing or invalid token format" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1]?.trim();
    console.log("Received Token:", token);

    if (!token) {
      console.error("Unauthorized: Token is empty");
      return NextResponse.json({ message: "Unauthorized: Token is empty" }, { status: 401 });
    }

    // Validate Token
    const user = getUserFromToken(token);
    if (!user || !user.userId) {
      console.error("Unauthorized: Invalid or expired token");
      return NextResponse.json({ message: "Unauthorized: Invalid or expired token" }, { status: 401 });
    }

    console.log(`Placing an order for user: ${user.userId}`);

    // Extract order details
    const { cart, totalAmount } = await req.json();
    console.log("Received Cart Data:", { cart, totalAmount });

    if (!cart || cart.length === 0) {
      console.error("Bad Request: Cart is empty");
      return NextResponse.json({ message: "Bad Request: Cart is empty" }, { status: 400 });
    }

    // Save order to database
    const newOrder = new Order({
      userId: user.userId,
      products: cart.map((item: any) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount,
      paymentStatus: "Paid", // Change this later if adding payment integration
    });

    await newOrder.save();
    console.log(`Order placed successfully for user: ${user.userId}`);

    return NextResponse.json({ message: "Order placed successfully", order: newOrder }, { status: 201 });
  } catch (error) {
    console.error("Error placing order:", error);
    return NextResponse.json(
      { message: "Server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
