import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";
import { getUserFromToken } from "@/lib/authMiddleware";

//  PUT: Update Service by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { serviceid: string } }
) {
  await dbConnect();

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const user = getUserFromToken(token || "");

  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { message: "Unauthorized. Admins only." },
      { status: 403 }
    );
  }

  try {
    const { name, description, price, duration } = await req.json();

    if (!name || !description || !price || !duration) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    const updated = await Service.findByIdAndUpdate(
      params.serviceid,
      { name, description, price, duration },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Service not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Service updated",
      service: updated,
    });
  } catch (error) {
    console.error("Failed to update service:", error);
    return NextResponse.json(
      { message: "Failed to update service" },
      { status: 500 }
    );
  }
}

// DELETE: Delete Service by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { serviceid: string } }
) {
  await dbConnect();

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const user = getUserFromToken(token || "");

  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { message: "Unauthorized. Admins only." },
      { status: 403 }
    );
  }

  try {
    const deleted = await Service.findByIdAndDelete(params.serviceid);

    if (!deleted) {
      return NextResponse.json(
        { message: "Service not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Service deleted" });
  } catch (error) {
    console.error("Failed to delete service:", error);
    return NextResponse.json(
      { message: "Failed to delete service" },
      { status: 500 }
    );
  }
}
