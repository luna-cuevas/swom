import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type Listing = {
  id: string;
  user_info: {
    email: string;
  };
};

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    // First get all listings with their user info
    const { data: listings, error: listingsError } = await supabase
      .from("listings")
      .select(
        `
        id,
        status,
        created_at,
        is_highlighted,
        user_id,
        privacy_policy_accepted,
        privacy_policy_date,
        slug,
        highlight_tag,
        global_order_rank,
        highlighted_order_rank,
        home_info:home_info_id!inner(
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
          main_or_second
        ),
        user_info:user_info_id!inner(
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
          open_to_other_destinations
        ),
        amenities:amenities_id!inner(
          id,
          bike,
          car,
          tv,
          dishwasher,
          pingpong,
          billiards,
          washer,
          dryer,
          wifi,
          elevator,
          terrace,
          scooter,
          bbq,
          computer,
          wc_access,
          pool,
          playground,
          baby_gear,
          ac,
          fireplace,
          parking,
          hot_tub,
          sauna,
          other,
          doorman,
          cleaning_service,
          video_games,
          tennis_court,
          gym
        )
      `
      )
      .order("global_order_rank", { ascending: true });

    if (listingsError) throw listingsError;

    // Then get subscription status for each listing's user
    const listingsWithSubs = await Promise.all(
      listings!.map(async (listing: any) => {
        const { data: appUser } = await supabase
          .from("appUsers")
          .select("subscribed")
          .eq("email", listing.user_info.email)
          .single();

        return {
          ...listing,
          subscription_status: appUser?.subscribed || false,
        };
      })
    );

    return NextResponse.json(listingsWithSubs);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
