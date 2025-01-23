import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    // First, check if we can access the table
    const { data: testData, error: testError } = await supabase
      .from("needs_approval")
      .select("id")
      .limit(1);

    if (testError) {
      console.error("Error accessing needs_approval table:", testError);
      throw new Error("Database access error");
    }

    // Get the actual data
    const { data, error } = await supabase
      .from("needs_approval")
      .select(
        `
        id,
        status,
        created_at,
        is_highlighted,
        submission_id,
        privacy_policy_accepted,
        privacy_policy_date,
        slug,
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
          main_or_second
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
          open_to_other_destinations
        ),
        amenities:amenities_id(
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
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending listings:", error);
      throw error;
    }

    if (!data) {
      console.error("No data returned from query");
      throw new Error("No data returned from query");
    }

    // Log the number of results for debugging
    console.log(`Found ${data.length} pending listings`);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in getPendingListings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch pending listings" },
      { status: 500 }
    );
  }
}
