import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/logging";

interface HomeInfo {
  title: string;
}

interface UserInfo {
  email: string;
}

interface ListingData {
  is_highlighted: boolean;
  home_info: HomeInfo;
  user_info: UserInfo;
}

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const { listingId, adminId } = await req.json();

    if (!listingId || !adminId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // First try to find and update in listings table
    const { data: listingData, error: listingFetchError } = (await supabase
      .from("listings")
      .select(
        `
        is_highlighted,
        home_info:home_info_id(title),
        user_info:user_info_id(email)
      `
      )
      .eq("id", listingId)
      .single()) as { data: ListingData | null; error: any };

    if (listingData) {
      // Update in listings table
      const { error: updateError } = await supabase
        .from("listings")
        .update({ is_highlighted: !listingData.is_highlighted })
        .eq("id", listingId);

      if (updateError) throw updateError;

      // Log the highlight toggle action
      await logAdminAction(supabase, adminId, "toggle_highlight", {
        listing_id: listingId,
        listing_title: listingData.home_info.title,
        user_email: listingData.user_info.email,
        previous_state: listingData.is_highlighted,
        new_state: !listingData.is_highlighted,
        table: "listings",
      });

      return NextResponse.json({
        success: true,
        is_highlighted: !listingData.is_highlighted,
      });
    }

    // If not found in listings, try needs_approval table
    const { data: pendingData, error: pendingFetchError } = (await supabase
      .from("needs_approval")
      .select(
        `
        is_highlighted,
        home_info:home_info_id(title),
        user_info:user_info_id(email)
      `
      )
      .eq("id", listingId)
      .single()) as { data: ListingData | null; error: any };

    if (pendingFetchError) throw pendingFetchError;
    if (!pendingData) throw new Error("Listing not found in any table");

    // Update in needs_approval table
    const { error: updateError } = await supabase
      .from("needs_approval")
      .update({ is_highlighted: !pendingData.is_highlighted })
      .eq("id", listingId);

    if (updateError) throw updateError;

    // Log the highlight toggle action for pending listing
    await logAdminAction(supabase, adminId, "toggle_highlight", {
      listing_id: listingId,
      listing_title: pendingData.home_info.title,
      user_email: pendingData.user_info.email,
      previous_state: pendingData.is_highlighted,
      new_state: !pendingData.is_highlighted,
      table: "needs_approval",
    });

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
