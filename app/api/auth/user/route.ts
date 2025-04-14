import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/authMiddleware";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        await dbConnect();

        //  Extract token from headers
        const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized: No token" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1].trim(); //  Extract token
        const userData = getUserFromToken(token); //  Now it correctly passes token string

        if (!userData || !userData.userId) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        //  Find user in the database
        const user = await User.findById(userData.userId).select("name email role");
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });

    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
