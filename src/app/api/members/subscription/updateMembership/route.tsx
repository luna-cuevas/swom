import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";

export async function POST(req: Request, res: Response) {
  const body = await req.json();
  const origin = req.headers.get("origin") || "http://localhost:3000";

  try {
    const customers = await stripe.customers.list({ email: body.email });
    const customer = customers.data[0];

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${origin}/membership?customer_id=${customer.id}`,
    });
    return NextResponse.json(session.url);
  } catch (error) {
    return NextResponse.json({ res, error: error });
  }
}
