// File: models/Schedule.ts

import mongoose, { Schema } from "mongoose";

const ScheduleSchema = new Schema(
  {
    stylistId: {
      type: Schema.Types.ObjectId,
      ref: "Stylist",
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },
    startTime: { type: String, required: true }, // e.g. "09:00"
    endTime: { type: String, required: true },   // e.g. "17:00"
  },
  { timestamps: true }
);

export default mongoose.models.Schedule || mongoose.model("Schedule", ScheduleSchema);
