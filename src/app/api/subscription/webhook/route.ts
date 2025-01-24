import { getSupabaseAdmin } from "@/utils/supabaseClient";
import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    // Validate environment variables
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found in request");
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("[webhook] Event received:", event.type);
    } catch (err) {
      console.error("[webhook] Signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Helper function to get customer email
    const getCustomerEmail = async (customerId: string): Promise<string> => {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        throw new Error("Customer was deleted");
      }
      if (!customer.email) {
        throw new Error("No email found for customer");
      }
      return customer.email;
    };

    switch (event.type) {
      case "customer.subscription.created": {
        console.log("[webhook] Processing subscription creation");
        const subscription = event.data.object as Stripe.Subscription;
        const email = await getCustomerEmail(subscription.customer as string);

        // Update user's subscription status
        const { error: updateError } = await supabase
          .from("appUsers")
          .update({
            subscribed: true,
            subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
          })
          .eq("email", email);

        if (updateError) {
          console.error("[webhook] Error updating user:", updateError);
          throw updateError;
        }

        console.log("[webhook] Successfully updated subscription for:", email);
        break;
      }

      case "customer.subscription.updated": {
        console.log("[webhook] Processing subscription update");
        const subscription = event.data.object as Stripe.Subscription;
        const email = await getCustomerEmail(subscription.customer as string);

        // Update subscription status based on subscription object
        const { error: updateError } = await supabase
          .from("appUsers")
          .update({
            subscribed: subscription.status === "active",
            subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
          })
          .eq("email", email);

        if (updateError) {
          console.error("[webhook] Error updating subscription:", updateError);
          throw updateError;
        }

        console.log("[webhook] Successfully updated subscription for:", email);
        break;
      }

      case "customer.subscription.deleted": {
        console.log("[webhook] Processing subscription deletion");
        const subscription = event.data.object as Stripe.Subscription;
        const email = await getCustomerEmail(subscription.customer as string);

        // Update user's subscription status to cancelled
        const { error: updateError } = await supabase
          .from("appUsers")
          .update({
            subscribed: false,
            subscription_id: null,
          })
          .eq("email", email);

        if (updateError) {
          console.error("[webhook] Error cancelling subscription:", updateError);
          throw updateError;
        }

        console.log("[webhook] Successfully cancelled subscription for:", email);
        break;
      }

      case "invoice.payment_failed": {
        console.log("[webhook] Processing payment failure");
        const invoice = event.data.object as Stripe.Invoice;
        const email = await getCustomerEmail(invoice.customer as string);

        // Optionally update user's status or send notification
        const { error: updateError } = await supabase
          .from("appUsers")
          .update({
            subscribed: false,
          })
          .eq("email", email);

        if (updateError) {
          console.error("[webhook] Error updating payment failure status:", updateError);
          throw updateError;
        }

        console.log("[webhook] Successfully handled payment failure for:", email);
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[webhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
} 