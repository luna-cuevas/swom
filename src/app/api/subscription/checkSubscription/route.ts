import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Retrieve the customer by email
    const customers = await stripe.customers.list({ email });
    const customer = customers.data[0];

    if (customer) {
      // Retrieve the customer's subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 1,
        status: 'active', // Only get active subscriptions
      });

      return NextResponse.json({
        isSubscribed: subscriptions.data.length > 0
      });
    }

    return NextResponse.json({ isSubscribed: false });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json(
      { error: "Failed to check subscription status" },
      { status: 500 }
    );
  }
} 