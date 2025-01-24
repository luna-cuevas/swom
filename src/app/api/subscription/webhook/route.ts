import { getSupabaseAdmin } from "@/utils/supabaseClient";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";
import Stripe from "stripe";

// Configure the runtime
export const runtime = 'nodejs';

// New way to configure the route in App Router
export const dynamic = 'force-dynamic';
export const preferredRegion = 'auto';

// Utility function for consistent error logging
function logError(context: string, error: any, additionalData?: any) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorDetails = {
    context,
    error: errorMessage,
    timestamp: new Date().toISOString(),
    ...(additionalData && { additionalData }),
  };
  console.error(JSON.stringify(errorDetails, null, 2));
  return errorDetails;
}

// Utility function for consistent success logging
function logSuccess(context: string, data?: any) {
  const logDetails = {
    context,
    success: true,
    timestamp: new Date().toISOString(),
    ...(data && { data }),
  };
  console.log(JSON.stringify(logDetails, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }

    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found in request");
    }

    let event: Stripe.Event;
    const supabase = getSupabaseAdmin();

    try {
      // Log the values we're using for verification
      console.log('Webhook verification details:');
      console.log('Secret:', process.env.STRIPE_WEBHOOK_SECRET);
      console.log('Signature:', signature);
      console.log('Body length:', rawBody.length);
      console.log('Body preview:', rawBody.substring(0, 100));

      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      logSuccess("Webhook event received", {
        type: event.type,
        eventId: event.id,
        apiVersion: event.api_version
      });
    } catch (err) {
      const error = logError("Webhook signature verification failed", err, {
        signatureHeader: signature,
        bodyPreview: rawBody.substring(0, 100)
      });
      return NextResponse.json({ error }, { status: 400 });
    }

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
        logSuccess("Processing subscription creation");
        const subscription = event.data.object as Stripe.Subscription;
        const email = await getCustomerEmail(subscription.customer as string);

        const { error: updateError } = await supabase
          .from("appUsers")
          .update({
            subscribed: true,
            subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
          })
          .eq("email", email);

        if (updateError) {
          throw new Error(`Failed to update user: ${updateError.message}`);
        }

        logSuccess("Successfully updated subscription", { email });
        break;
      }

      case "customer.subscription.updated": {
        logSuccess("Processing subscription update");
        const subscription = event.data.object as Stripe.Subscription;
        const email = await getCustomerEmail(subscription.customer as string);

        const { error: updateError } = await supabase
          .from("appUsers")
          .update({
            subscribed: subscription.status === "active",
            subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
          })
          .eq("email", email);

        if (updateError) {
          throw new Error(`Failed to update subscription: ${updateError.message}`);
        }

        logSuccess("Successfully updated subscription", { email });
        break;
      }

      case "customer.subscription.deleted": {
        logSuccess("Processing subscription deletion");
        const subscription = event.data.object as Stripe.Subscription;
        const email = await getCustomerEmail(subscription.customer as string);

        const { error: updateError } = await supabase
          .from("appUsers")
          .update({
            subscribed: false,
            subscription_id: null,
          })
          .eq("email", email);

        if (updateError) {
          throw new Error(`Failed to cancel subscription: ${updateError.message}`);
        }

        logSuccess("Successfully cancelled subscription", { email });
        break;
      }

      case "invoice.payment_failed": {
        logSuccess("Processing payment failure");
        const invoice = event.data.object as Stripe.Invoice;
        const email = await getCustomerEmail(invoice.customer as string);

        const { error: updateError } = await supabase
          .from("appUsers")
          .update({
            subscribed: false,
          })
          .eq("email", email);

        if (updateError) {
          throw new Error(`Failed to update payment failure status: ${updateError.message}`);
        }

        logSuccess("Successfully handled payment failure", { email });
        break;
      }

      default:
        logSuccess("Unhandled event type", { type: event.type });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorDetails = logError("Webhook processing failed", error);
    return NextResponse.json(
      { error: errorDetails },
      {
        status: error instanceof Error && error.message.includes("signature")
          ? 400
          : 500,
      }
    );
  }
} 