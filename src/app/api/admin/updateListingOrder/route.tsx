import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/logging";

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const { listingId, newRank, isHighlighted, adminId } = await request.json();

    if (!listingId || typeof newRank !== "number" || !adminId) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    // Get listing details for logging
    const { data: listing, error: fetchError } = await supabase
      .from("listings")
      .select(
        `
        *,
        home_info:home_info_id(title),
        user_info:user_info_id(email)
      `
      )
      .eq("id", listingId)
      .single();

    if (fetchError) {
      console.error("Error fetching listing details:", fetchError);
      throw fetchError;
    }

    const oldRank = isHighlighted
      ? listing.highlighted_order_rank
      : listing.global_order_rank;

    // Update the appropriate order rank based on whether it's a highlighted listing
    const { error } = await supabase
      .from("listings")
      .update({
        [isHighlighted ? "highlighted_order_rank" : "global_order_rank"]:
          newRank,
      })
      .eq("id", listingId);

    if (error) throw error;

    // Log the order change
    await logAdminAction(supabase, adminId, "update_listing_order", {
      listing_id: listingId,
      listing_title: listing.home_info.title,
      user_email: listing.user_info.email,
      order_type: isHighlighted ? "highlighted" : "global",
      previous_rank: oldRank,
      new_rank: newRank,
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
