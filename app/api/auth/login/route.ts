import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        console.log("🔍 Connecting to database...");
        await dbConnect();
        console.log("Database connected");

        //  Extract and validate input
        const { email, password } = await req.json();
        if (!email || !password) {
            console.log("Missing email or password");
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        }

        console.log(`Checking user: ${email}`);

        // Find user in DB
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        //  Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Invalid password");
            return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
        }

        //  Ensure `JWT_SECRET` exists
        if (!process.env.JWT_SECRET) {
            console.error("Missing JWT_SECRET in environment variables!");
            return NextResponse.json({ message: "Server error: Missing JWT secret" }, { status: 500 });
        }

        //  Generate JWT token
        const token = jwt.sign(
            { userId: user._id.toString(), role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("Token Generated:", token);

        // Send response with token
        return NextResponse.json({
            message: "Login successful",
            token,
            user: { 
                id: user._id.toString(),
                name: user.name, 
                email: user.email, 
                role: user.role 
            }
        }, { status: 200 });

    } catch (error: unknown) {
        console.error("Login Error:", error);
        
        let errorMessage = "An unexpected error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json(
            { message: "Server error", error: errorMessage },
            { status: 500 }
        );
    }
}
