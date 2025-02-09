import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { listingId, adminId } = await request.json();

    if (!listingId || !adminId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    // First get the listing to get related IDs
    const { data: listing, error: fetchError } = await supabase
      .from("needs_approval")
      .select("home_info_id, user_info_id, amenities_id")
      .eq("id", listingId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch listing: ${fetchError.message}`);
    }

    // Delete in sequence
    const { error: needsApprovalError } = await supabase
      .from("needs_approval")
      .delete()
      .eq("id", listingId);

    if (needsApprovalError) throw needsApprovalError;

    const { error: homeInfoError } = await supabase
      .from("home_info")
      .delete()
      .eq("id", listing.home_info_id);

    if (homeInfoError) throw homeInfoError;

    const { error: amenitiesError } = await supabase
      .from("amenities")
      .delete()
      .eq("id", listing.amenities_id);

    if (amenitiesError) throw amenitiesError;

    const { error: userInfoError } = await supabase
      .from("user_info")
      .delete()
      .eq("id", listing.user_info_id);

    if (userInfoError) throw userInfoError;

    // Log the admin action
    const { error: logError } = await supabase.from("admin_logs").insert({
      admin_id: adminId,
      action: "delete",
      table_name: "needs_approval",
      record_id: listingId,
    });

    if (logError) {
      console.error("Failed to log admin action:", logError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting listing:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete listing" },
      { status: 500 }
    );
  }
} 