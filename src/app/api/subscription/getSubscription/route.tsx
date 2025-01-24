import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const customers = await stripe.customers.list({ email: body.email });
    const customer = customers.data[0];

    if (customer) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 1,
      });

      return NextResponse.json(subscriptions.data[0]);
    } else {
      return NextResponse.json({ message: "No customer found" });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
