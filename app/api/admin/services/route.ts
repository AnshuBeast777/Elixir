import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";
import { getUserFromToken } from "@/lib/authMiddleware";

// GET (Fetch all services)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Explicitly selecting fields for optimization
    const services = await Service.find({}, "name description price duration").sort({ createdAt: -1 });

    return NextResponse.json({ services }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return NextResponse.json(
      { message: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

// POST (Create a new service)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Get and verify token
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const user = getUserFromToken(token || "");

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized. Admins only." },
        { status: 403 }
      );
    }

    const { name, description, price, duration } = await req.json();

    // Validate inputs
    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      typeof price !== "number" ||
      typeof duration !== "number"
    ) {
      return NextResponse.json(
        { message: "Invalid or missing fields." },
        { status: 400 }
      );
    }

    const newService = await Service.create({
      name,
      description,
      price,
      duration,
    });

    return NextResponse.json(
      { message: "Service created", service: newService },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create service:", error);
    return NextResponse.json(
      { message: "Failed to create service" },
      { status: 500 }
    );
  }
}
