import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Middleware to protect API routes
export async function middleware(req: Request) {
  const token = req.headers.get("authorization")?.split(" ")[1];

  //Allow public routes (e.g., login, register)
  if (req.url.includes("/api/auth")) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.json({ message: "Unauthorized: No token" }, { status: 401 });
  }

  try {
    // Verify token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);

    return NextResponse.next(); // Allow request
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 });
  }
}

// Apply middleware to protect API routes
export const config = {
  matcher: ["/api/orders/:path*", "/api/appointments/:path*"],
};
