import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Retrieve the customer by email
    const customers = await stripe.customers.list({ email: email });
    const customer = customers.data[0];

    if (!customer) {
      return NextResponse.json({ isSubscribed: false });
    }

    // Retrieve the customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 1,
    });

    return NextResponse.json({
      isSubscribed: subscriptions.data.length > 0
    });

  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json(
      { error: "Failed to check subscription status" },
      { status: 500 }
    );
  }
} 