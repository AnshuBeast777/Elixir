import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Get all services sorted by latest created
    const services = await Service.find({}, "name price duration description").sort({ createdAt: -1 });

    if (!services || services.length === 0) {
      return NextResponse.json({ message: "No services found", services: [] }, { status: 200 });
    }

    return NextResponse.json({ services }, { status: 200 });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { message: "Server error while fetching services" },
      { status: 500 }
    );
  }
}
