// app/checkout-sessions/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";
import Stripe from "stripe";

export interface CheckoutSubscriptionBody {
  priceId: string;
  email: string;
}

export async function POST(req: Request) {
  const body = (await req.json()) as CheckoutSubscriptionBody;
  const origin = req.headers.get("origin") || "http://localhost:3000";

  const success_url = `${origin}/sign-up?session_id={CHECKOUT_SESSION_ID}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: body.priceId,
          quantity: 1,
        },
      ],
      customer_email: body.email,
      allow_promotion_codes: true,
      success_url: success_url,
      cancel_url: `${origin}/home`,
    });
    return NextResponse.json(session);
  } catch (err: unknown) {
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { message: err.message },
        { status: err.statusCode }
      );
    }
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
