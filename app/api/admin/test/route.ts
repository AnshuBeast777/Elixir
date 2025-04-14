import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/authMiddleware";
import dbConnect from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  await dbConnect();

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const user = token ? getUserFromToken(token) : null;

  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized. Admins only." }, { status: 403 });
  }

  return NextResponse.json({ message: "Admin access granted!" });
}
