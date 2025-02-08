import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server";

type HomeInfo = {
  title: string;
  listing_images: string[];
}

type ListingResponse = {
  id: string;
  highlight_tag: string | null;
  home_info: HomeInfo;
  slug: string;
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { data: listings, error } = await supabase
      .from("listings")
      .select(
        `
        id,
        highlight_tag,
        slug,
        home_info:home_info_id(
          title,
          listing_images
        )
      `
      )
      .eq("is_highlighted", true)
      .order("highlighted_order_rank", { ascending: true });

    if (error) {
      throw error;
    }

    // Transform the data to include only necessary information
    const transformedListings = (listings as unknown as ListingResponse[]).map((listing) => ({
      id: listing.id,
      highlightTag: listing.highlight_tag || null,
      slug: listing.slug,
      homeInfo: {
        title: listing.home_info.title,
        firstImage: listing.home_info.listing_images[0],
      }
    }));

    return NextResponse.json(transformedListings);
  } catch (error) {
    console.error("Error fetching highlighted listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch highlighted listings" },
      { status: 500 }
    );
  }
} 