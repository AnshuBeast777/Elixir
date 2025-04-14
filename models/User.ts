import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["client", "admin"],
      default: "client",
    },
  },
  {
    timestamps: true,
  }
);

// Reuse model if already compiled
export default mongoose.models.User || mongoose.model("User", userSchema);
