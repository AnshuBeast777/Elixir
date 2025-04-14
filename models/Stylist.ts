import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStylist extends Document {
  name: string;
  bio?: string;
  specialization?: string;
}

const stylistSchema: Schema<IStylist> = new Schema(
  {
    name: { type: String, required: true },
    bio: { type: String },
    specialization: { type: String },
  },
  { timestamps: true }
);

const Stylist: Model<IStylist> = mongoose.models.Stylist || mongoose.model("Stylist", stylistSchema);
export default Stylist;
