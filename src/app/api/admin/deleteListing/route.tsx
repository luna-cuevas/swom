import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const { listingId, deleteUser, userId } = await req.json();

    if (!listingId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Delete the listing
    const { error: listingError } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId);

    if (listingError) throw listingError;

    // If deleteUser is true and we have a userId, delete the user from appUsers
    if (deleteUser && userId) {
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
