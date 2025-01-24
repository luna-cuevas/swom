import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";

export async function POST(req: Request, res: Response) {
  const body = await req.json();

  const subscription = await stripe.subscriptions.update(body.subscriptionId, {
    cancel_at_period_end: true,
  });
  if (subscription) {
    return NextResponse.json(subscription);
  } else {
    return NextResponse.json(res, subscription);
  }
}
