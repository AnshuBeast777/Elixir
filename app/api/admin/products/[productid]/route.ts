// app/api/admin/products/[productid]/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { getUserFromToken } from "@/lib/authMiddleware";

export async function PUT(req: NextRequest, { params }: { params: { productid: string } }) {
  try {
    await dbConnect();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const user = getUserFromToken(token || "");

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 403 });
    }

    const { name, price, image, description, stock } = await req.json();

    const updated = await Product.findByIdAndUpdate(
      params.productid,
      { name, price, image, description, stock },
      { new: true }
    );

    return NextResponse.json({ message: "Product updated", product: updated });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { productid: string } }) {
  try {
    await dbConnect();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const user = getUserFromToken(token || "");

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 403 });
    }

    await Product.findByIdAndDelete(params.productid);
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 });
  }
}
