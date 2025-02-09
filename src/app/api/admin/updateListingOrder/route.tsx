import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/logging";

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const { listings, adminId } = await request.json();

    if (!listings || !Array.isArray(listings) || !adminId) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    // Update each listing's order rank
    for (const listing of listings) {
      const { id, global_order_rank, highlighted_order_rank } = listing;

      if (!id) continue;

      const updateData: any = {};
      if (typeof global_order_rank === "number") {
        updateData.global_order_rank = global_order_rank;
      }
      if (typeof highlighted_order_rank === "number") {
        updateData.highlighted_order_rank = highlighted_order_rank;
      }

      const { error } = await supabase
        .from("listings")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    }

    // Log the order change
    await logAdminAction(supabase, adminId, "update_listing_order", {
      number_of_listings: listings.length,
      action: "bulk_update_order",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating listing order:", error);
    return NextResponse.json(
      { error: "Failed to update listing order" },
      { status: 500 }
    );
  }
}
