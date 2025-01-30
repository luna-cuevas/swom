import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const { listingId, newRank, isHighlighted } = await request.json();

    if (!listingId || typeof newRank !== "number") {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    // Update the appropriate order rank based on whether it's a highlighted listing
    const { error } = await supabase
      .from("listings")
      .update({
        [isHighlighted ? "highlighted_order_rank" : "global_order_rank"]:
          newRank,
      })
      .eq("id", listingId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating listing order:", error);
    return NextResponse.json(
      { error: "Failed to update listing order" },
      { status: 500 }
    );
  }
}
