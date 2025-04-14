// app/api/admin/products/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { getUserFromToken } from "@/lib/authMiddleware";

// GET all products (admin only)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const user = getUserFromToken(token || "");

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 403 });
    }

    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}

// POST new product (admin only)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const user = getUserFromToken(token || "");

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 403 });
    }

    const { name, price, image, description, stock } = await req.json();

    if (!name || !price || !image || !description) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    const newProduct = await Product.create({ name, price, image, description, stock });
    return NextResponse.json({ message: "Product created", product: newProduct });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 });
  }
}
