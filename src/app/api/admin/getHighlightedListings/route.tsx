import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const { data: listings, error } = await supabase
      .from("listings")
      .select(
        `
        id,
        status,
        created_at,
        highlight_tag,
        highlighted_order_rank,
        global_order_rank,
        home_info:home_info_id!inner(
          id,
          title,
          city,
          description,
          listing_images
        ),
        user_info:user_info_id!inner(
          id,
          name,
          email,
          recommended
        )
      `
      )
      .eq("is_highlighted", true)
      .order("highlighted_order_rank", { ascending: true });

    if (error) throw error;
    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error fetching highlighted listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch highlighted listings" },
      { status: 500 }
    );
  }
}
