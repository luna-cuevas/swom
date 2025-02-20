import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type AppUser = {
  email: string;
  subscribed: boolean;
};

type UserInfo = {
  id: string;
  email: string;
  name: string;
  profile_image_url: string;
  dob: string;
  phone: string;
  age: number;
  profession: string;
  about_me: string;
  children: string;
  recommended: string;
  open_to_other_cities: any;
  open_to_other_destinations: boolean;
  submission_id: string;
};

type HomeInfo = {
  id: string;
  title: string;
  city: string;
  description: string;
  listing_images: string[];
  address: string;
  property_type: string;
  how_many_sleep: number;
  located_in: string;
  bathrooms: number;
  area: number;
  main_or_second: string;
};

type ListingData = {
  id: string;
  status: string;
  created_at: string;
  is_highlighted: boolean;
  submission_id: string;
  privacy_policy_accepted: boolean;
  privacy_policy_date: string;
  slug: string;
  home_info: HomeInfo;
  user_info: UserInfo;
  amenities: Record<string, any>;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";

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

    let query = supabase.from("needs_approval").select(
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
          open_to_other_destinations,
          submission_id
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
    );

    if (status === "approved_unpaid") {
      // First get all approved listings
      const { data: approvedListings, error: approvedError } = (await query
        .eq("status", "approved")
        .order("created_at", { ascending: false })) as {
        data: ListingData[] | null;
        error: any;
      };

      if (approvedError) {
        console.error("Error fetching approved listings:", approvedError);
        throw approvedError;
      }

      // Then get all subscribed users' emails
      const { data: appUsers, error: appUsersError } = (await supabase
        .from("appUsers")
        .select("email")
        .eq("subscribed", true)) as { data: AppUser[] | null; error: any };

      if (appUsersError) {
        console.error("Error fetching app users:", appUsersError);
        throw appUsersError;
      }

      // Create a set of subscribed emails for faster lookup
      const subscribedEmails = new Set(
        appUsers?.map((user) => user.email) || []
      );

      // Filter out listings where the user is subscribed
      const unpaidListings =
        approvedListings?.filter(
          (listing) => !subscribedEmails.has(listing.user_info.email)
        ) || [];

      return NextResponse.json(unpaidListings);
    } else {
      const { data, error } = await query
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching listings:", error);
        throw error;
      }

      if (!data) {
        console.error("No data returned from query");
        throw new Error("No data returned from query");
      }

      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error("Error in getPendingListings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
