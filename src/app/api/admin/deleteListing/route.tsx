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
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId, deleteUser, userId } = await req.json();

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

    // Delete the listing
    const { error: listingError } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId);

    if (listingError) throw listingError;

    // Log the listing deletion
    await logAdminAction(supabase, session.user.id, "delete_listing", {
      listing_id: listingId,
      listing_title: listing.home_info.title,
      user_email: listing.user_info.email,
    });

    // If deleteUser is true and we have a userId, delete the user from appUsers
    if (deleteUser && userId) {
      // Get user details for logging before deletion
      const { data: userData, error: userFetchError } = await supabase
        .from("appUsers")
        .select("*")
        .eq("id", userId)
        .single();

      if (userFetchError) {
        console.error("Error fetching user details:", userFetchError);
        throw userFetchError;
      }

      const { error: userError } = await supabase
        .from("appUsers")
        .delete()
        .eq("id", userId);

      if (userError) {
        console.error("Error deleting user:", userError);
        return NextResponse.json(
          { error: "Failed to delete user, but listing was deleted" },
          { status: 500 }
        );
      }

      // Log the user deletion
      await logAdminAction(supabase, session.user.id, "delete_user", {
        user_id: userId,
        user_email: userData.email,
        reason: "listing_deletion",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}
