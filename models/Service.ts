import mongoose, { Schema, Document, Model } from "mongoose";

export interface IService extends Document {
  name: string;
  price: number;
  duration: number;
  description: string; 
}

const serviceSchema: Schema<IService> = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>("Service", serviceSchema);
export default Service;
