import { NextResponse } from "next/server";
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

if (!STRIPE_SECRET_KEY || !SITE_URL) {
  throw new Error("Missing STRIPE_SECRET_KEY or NEXT_PUBLIC_SITE_URL in .env.local");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export async function POST(req: Request) {
  console.log("Received request at /api/payments");

  try {
    const body = await req.json();
    const items = body?.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("Invalid or empty cart received:", items);
      return NextResponse.json({ error: "Missing or invalid cart items" }, { status: 400 });
    }

    // Prepare Stripe Line Items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // price in cents
      },
      quantity: item.quantity,
    }));

    // 🔹 Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${SITE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/cart`,
    });

    if (!session.id || !session.url) {
      throw new Error("Stripe session creation failed.");
    }

    console.log("Stripe Checkout Session Created:", session.id);

    return NextResponse.json({
      sessionId: session.id,
      sessionUrl: session.url,
    });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error.message || error);
    return NextResponse.json(
      {
        error: error?.message || "Payment processing failed",
      },
      { status: 500 }
    );
  }
}
