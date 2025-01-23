import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const { listingId } = await req.json();

    if (!listingId) {
      return NextResponse.json(
        { error: "Missing listing ID" },
        { status: 400 }
      );
    }

    // First try to find and update in listings table
    const { data: listingData, error: listingFetchError } = await supabase
      .from("listings")
      .select("is_highlighted")
      .eq("id", listingId)
      .single();

    if (listingData) {
      // Update in listings table
      const { error: updateError } = await supabase
        .from("listings")
        .update({ is_highlighted: !listingData.is_highlighted })
        .eq("id", listingId);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        is_highlighted: !listingData.is_highlighted,
      });
    }

    // If not found in listings, try needs_approval table
    const { data: pendingData, error: pendingFetchError } = await supabase
      .from("needs_approval")
      .select("is_highlighted")
      .eq("id", listingId)
      .single();

    if (pendingFetchError) throw pendingFetchError;
    if (!pendingData) throw new Error("Listing not found in any table");

    // Update in needs_approval table
    const { error: updateError } = await supabase
      .from("needs_approval")
      .update({ is_highlighted: !pendingData.is_highlighted })
      .eq("id", listingId);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      is_highlighted: !pendingData.is_highlighted,
    });
  } catch (error) {
    console.error("Error toggling highlight status:", error);
    return NextResponse.json(
      { error: "Failed to toggle highlight status" },
      { status: 500 }
    );
  }
}
