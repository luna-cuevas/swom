import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function PUT(request: Request) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { listingId, userEmail, currentStatus } = await request.json();

    if (!listingId || !userEmail || !currentStatus) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If currently archived, set to pending, otherwise set to archived
    const newStatus = currentStatus === "archived" ? "approved" : "archived";

    // Update the listing status
    const { error: updateError } = await supabase
      .from("listings")
      .update({ status: newStatus })
      .eq("id", listingId);

    if (updateError) {
      console.error("Error updating listing status:", updateError);
      return NextResponse.json(
        { error: "Failed to update listing status" },
        { status: 500 }
      );
    }

    // Check how many active listings the user has
    const { data: activeListings, error: countError } = await supabase
      .from("listings")
      .select(`
        id,
        status
      `)
      .eq("email", userEmail)
      .in("status", ["approved"]);

    if (countError) {
      console.error("Error counting active listings:", countError);
      return NextResponse.json(
        { error: "Failed to check active listings count" },
        { status: 500 }
      );
    }

    // User can create a new listing if they have fewer than 2 active listings
    const canCreateNew = activeListings.length < 2;

    // Get the updated listing data
    const { data: updatedListing, error: fetchError } = await supabase
      .from("listings")
      .select(
        `
        id,
        user_id,
        user_info_id,
        home_info_id,
        amenities_id,
        highlight_tag,
        slug,
        privacy_policy_accepted,
        privacy_policy_date,
        created_at,
        updated_at,
        is_highlighted,
        status,
        highlighted_order_rank,
        global_order_rank,
        email,
        home_info:home_info_id(
          id,
          title,
          city,
          description,
          listing_images,
          address,
          property_type,
          how_many_sleep,
          located_in,
          bathrooms,
          area,
          main_or_second,
          created_at,
          updated_at,
          submission_id
        ),
        user_info:user_info_id(
          id,
          email,
          name,
          profile_image_url,
          dob,
          phone,
          age,
          profession,
          about_me,
          children,
          recommended,
          open_to_other_cities,
          open_to_other_destinations,
          created_at,
          updated_at,
          submission_id
        ),
        amenities:amenities_id(*)
      `
      )
      .eq("id", listingId)
      .single();

    if (fetchError) {
      console.error("Error fetching updated listing:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch updated listing" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      canCreateNew,
      newStatus,
      listing: updatedListing,
    });
  } catch (error) {
    console.error("Error in archiveListing route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 