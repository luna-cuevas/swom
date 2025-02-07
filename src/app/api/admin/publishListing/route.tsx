import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/logging";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    // Get admin session

    const { listingId, status, adminId } = await req.json();

    if (!listingId || !status || !adminId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get listing details for logging
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*, home_info:home_info_id(title), user_info:user_info_id(email)")
      .eq("id", listingId)
      .single();

    if (listingError) {
      console.error("Error fetching listing details:", listingError);
      throw listingError;
    }

    // Update the listing status
    const { data, error } = await supabase
      .from("listings")
      .update({ status: status === "publish" ? "published" : "archived" })
      .eq("id", listingId)
      .select()
      .single();

    if (error) throw error;

    // Log the admin action
    await logAdminAction(supabase, adminId, `${status}_listing`, {
      listing_id: listingId,
      listing_title: listing.home_info.title,
      user_email: listing.user_info.email,
      slug: listing.slug,
      previous_status: listing.status,
      new_status: status === "publish" ? "published" : "archived",
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating listing publish status:", error);
    return NextResponse.json(
      { error: "Failed to update listing publish status" },
      { status: 500 }
    );
  }
}
