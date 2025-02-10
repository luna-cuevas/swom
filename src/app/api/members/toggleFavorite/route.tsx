import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const { listingId, userId } = await request.json();

    if (!listingId || !userId) {
      return NextResponse.json(
        { error: "Listing ID and User ID are required" },
        { status: 400 }
      );
    }

    // Get current favorites
    const { data: user, error: userError } = await supabase
      .from("appUsers")
      .select("favorites")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    // Ensure favorites is an array
    let favorites = user?.favorites || [];
    if (!Array.isArray(favorites)) {
      favorites = [];
    }

    interface Favorite {
      listingId: string;
    }

    // Check if the listing is already favorited
    const isLiked = favorites.some(
      (fav: Favorite) => fav?.listingId === listingId
    );

    if (isLiked) {
      // Remove from favorites
      favorites = favorites.filter(
        (fav: Favorite) => fav?.listingId !== listingId
      );
    } else {
      // Add to favorites
      favorites.push({ listingId });
    }

    // Update favorites
    const { data, error } = await supabase
      .from("appUsers")
      .update({ favorites })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ favorite: !isLiked });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 }
    );
  }
}
