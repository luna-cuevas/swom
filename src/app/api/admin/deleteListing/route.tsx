import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/logging";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const { listingId, deleteUser, userId, adminId } = await req.json();

    if (!listingId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get listing details for logging before deletion
    const { data: listing, error: listingFetchError } = await supabase
      .from("listings")
      .select("*, home_info:home_info_id(title), user_info:user_info_id(email)")
      .eq("id", listingId)
      .single();

    if (listingFetchError) {
      console.error("Error fetching listing details:", listingFetchError);
      throw listingFetchError;
    }

    // Begin deletion process for all related data
    const deletionErrors = [];

    // 1. Delete from listings table
    const { error: listingError } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId);

    if (listingError) {
      deletionErrors.push({ table: "listings", error: listingError });
    }

    // 2. Delete from home_info table if it exists
    if (listing.home_info_id) {
      const { error: homeInfoError } = await supabase
        .from("home_info")
        .delete()
        .eq("id", listing.home_info_id);

      if (homeInfoError) {
        deletionErrors.push({ table: "home_info", error: homeInfoError });
      }
    }

    // 3. Delete from amenities table if it exists
    if (listing.amenities_id) {
      const { error: amenitiesError } = await supabase
        .from("amenities")
        .delete()
        .eq("id", listing.amenities_id);

      if (amenitiesError) {
        deletionErrors.push({ table: "amenities", error: amenitiesError });
      }
    }

    // 4. Delete from user_info table if deleteUser is true
    if (deleteUser && listing.user_info_id) {
      const { error: userInfoError } = await supabase
        .from("user_info")
        .delete()
        .eq("id", listing.user_info_id);

      if (userInfoError) {
        deletionErrors.push({ table: "user_info", error: userInfoError });
      }
    }

    // If deleteUser is true and we have a userId, delete the user from appUsers and auth
    if (deleteUser && userId) {
      // Get user details for logging before deletion
      const { data: userData, error: userFetchError } = await supabase
        .from("appUsers")
        .select("*")
        .eq("id", userId)
        .single();

      if (!userFetchError && userData) {
        // Delete from appUsers
        const { error: appUserError } = await supabase
          .from("appUsers")
          .delete()
          .eq("id", userId);

        if (appUserError) {
          deletionErrors.push({ table: "appUsers", error: appUserError });
        }

        // Delete from auth.users
        const { error: authUserError } =
          await supabase.auth.admin.deleteUser(userId);

        if (authUserError) {
          deletionErrors.push({ table: "auth.users", error: authUserError });
        }

        // Log the user deletion if successful
        if (!appUserError && !authUserError) {
          await logAdminAction(supabase, adminId, "delete_user", {
            user_id: userId,
            user_email: userData.email,
            reason: "listing_deletion",
          });
        }
      }
    }

    // Log the listing deletion
    await logAdminAction(supabase, adminId, "delete_listing", {
      listing_id: listingId,
      listing_title: listing.home_info.title,
      user_email: listing.user_info.email,
      deletion_errors:
        deletionErrors.length > 0 ? JSON.stringify(deletionErrors) : "none",
    });

    // If there were any errors, return them but indicate partial success
    if (deletionErrors.length > 0) {
      return NextResponse.json(
        {
          warning: "Some related data could not be deleted",
          errors: deletionErrors,
          success: true,
        },
        { status: 207 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in deletion process:", error);
    return NextResponse.json(
      { error: "Failed to complete deletion process", details: error },
      { status: 500 }
    );
  }
}
