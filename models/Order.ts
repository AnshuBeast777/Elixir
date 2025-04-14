import mongoose, { Schema, Document, Model } from "mongoose";

// Define TypeScript Interface
export interface IOrder extends Document {
  userId: string;
  stripeSessionId: string;
  stripeRedirectUrl?: string;
  products: {
    _id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  paymentStatus: "Pending" | "Paid" | "Refunded";
  createdAt: Date;
}

//  Define Mongoose Schema
const orderSchema: Schema<IOrder> = new Schema({
  userId: {
    type: String,
    required: true,
  },

  stripeSessionId: {
    type: String,
    required: true,
    index: true, //  Improves Stripe webhook lookup
  },

  stripeRedirectUrl: {
    type: String,
  },

  products: [
    {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],

  totalAmount: {
    type: Number,
    required: true,
  },

  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Refunded"],
    default: "Pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create model
const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
export default Order;
