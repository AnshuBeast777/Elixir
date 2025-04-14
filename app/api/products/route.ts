import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product"; //  Adjusted path to match your structure
import { NextResponse } from "next/server";

// Get all products (for clients)
export async function GET() {
  await dbConnect();
  const products = await Product.find();
  return NextResponse.json({ products });
}

//  Add a new product (for admin)
export async function POST(req: Request) {
  await dbConnect();
  const { name, price, image, description, stock } = await req.json();
  
  const newProduct = new Product({ name, price, image, description, stock });
  await newProduct.save();
  
  return NextResponse.json({ message: "Product added successfully", product: newProduct }, { status: 201 });
}
