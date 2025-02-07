import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logMemberAction } from "@/lib/logging";

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    // Get the request body
    const data = await request.json();
    console.log("Received data:", data);

    // Check if user already has 2 listings
    const { data: existingListings, error: countError } = await supabase
      .from("listings")
      .select("id")
      .eq("email", data.user_email)
      .in("status", ["approved"]);

    if (countError) {
      console.error("Error checking existing listings:", countError);
      return NextResponse.json(
        { error: "Error checking existing listings" },
        { status: 500 }
      );
    }

    if (existingListings && existingListings.length >= 2) {
      return NextResponse.json(
        { error: "You can only have a maximum of 2 listings" },
        { status: 400 }
      );
    }

    // Generate a slug from the title
    const slug = data.home_info.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Insert user info
    const { data: userInfoData, error: userInfoError } = await supabase
      .from("user_info")
      .insert({
        name: data.user_info.name,
        email: data.user_info.email,
        phone: data.user_info.phone,
        profession: data.user_info.profession,
        age: data.user_info.age,
        dob: data.user_info.dob,
        about_me: data.user_info.about_me,
        children: data.user_info.children,
        recommended: data.user_info.recommended,
        open_to_other_cities: data.user_info.open_to_other_cities,
        open_to_other_destinations: data.user_info.open_to_other_destinations,
      })
      .select()
      .single();

    if (userInfoError) {
      console.error("Error inserting user info:", userInfoError);
      return NextResponse.json(
        { error: "Error inserting user info: " + userInfoError.message },
        { status: 500 }
      );
    }

    // Insert home info
    const { data: homeInfoData, error: homeInfoError } = await supabase
      .from("home_info")
      .insert({
        title: data.home_info.title,
        city: data.home_info.city,
        description: data.home_info.description,
        property_type: data.home_info.property_type,
        how_many_sleep: data.home_info.how_many_sleep,
        bathrooms: data.home_info.bathrooms,
        area: data.home_info.area,
        located_in: data.home_info.located_in,
        main_or_second: data.home_info.main_or_second,
        address: data.home_info.address,
        listing_images: data.home_info.listing_images || [],
      })
      .select()
      .single();

    if (homeInfoError) {
      console.error("Error inserting home info:", homeInfoError);
      return NextResponse.json(
        { error: "Error inserting home info: " + homeInfoError.message },
        { status: 500 }
      );
    }

    // Insert amenities
    const { data: amenitiesData, error: amenitiesError } = await supabase
      .from("amenities")
      .insert({
        bike: Boolean(data.amenities.bike),
        car: Boolean(data.amenities.car),
        tv: Boolean(data.amenities.tv),
        dishwasher: Boolean(data.amenities.dishwasher),
        pingpong: Boolean(data.amenities.pingpong),
        billiards: Boolean(data.amenities.billiards),
        washer: Boolean(data.amenities.washer),
        dryer: Boolean(data.amenities.dryer),
        wifi: Boolean(data.amenities.wifi),
        elevator: Boolean(data.amenities.elevator),
        terrace: Boolean(data.amenities.terrace),
        scooter: Boolean(data.amenities.scooter),
        bbq: Boolean(data.amenities.bbq),
        computer: Boolean(data.amenities.computer),
        wc_access: Boolean(data.amenities.wc_access),
        pool: Boolean(data.amenities.pool),
        playground: Boolean(data.amenities.playground),
        baby_gear: Boolean(data.amenities.baby_gear),
        ac: Boolean(data.amenities.ac),
        fireplace: Boolean(data.amenities.fireplace),
        parking: Boolean(data.amenities.parking),
        hot_tub: Boolean(data.amenities.hot_tub),
        sauna: Boolean(data.amenities.sauna),
        other: data.amenities.other || false,
        doorman: Boolean(data.amenities.doorman),
        cleaning_service: Boolean(data.amenities.cleaning_service),
        video_games: Boolean(data.amenities.video_games),
        tennis_court: Boolean(data.amenities.tennis_court),
        gym: Boolean(data.amenities.gym),
      })
      .select()
      .single();

    if (amenitiesError) {
      console.error("Error inserting amenities:", amenitiesError);
      return NextResponse.json(
        { error: "Error inserting amenities: " + amenitiesError.message },
        { status: 500 }
      );
    }

    // Create the listing with references to other tables
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .insert([
        {
          user_id: data.user_id,
          email: data.user_email,
          user_info_id: userInfoData.id,
          home_info_id: homeInfoData.id,
          amenities_id: amenitiesData.id,
          status: "approved",
          slug: slug,
          created_at: new Date().toISOString(),
          is_highlighted: false,
          privacy_policy_accepted: true,
          privacy_policy_date: new Date().toISOString(),
          global_order_rank: 0,
          highlighted_order_rank: null,
        },
      ])
      .select();

    if (listingError) {
      console.error("Error creating listing:", listingError);
      return NextResponse.json(
        { error: "Error creating listing: " + listingError.message },
        { status: 500 }
      );
    }

    // Log the create action
    await logMemberAction(supabase, data.user_id, "create_listing", {
      listing_id: listing[0].id,
      listing_title: data.home_info.title,
      city: data.home_info.city,
    });

    return NextResponse.json(listing);
  } catch (error: any) {
    console.error("Error in createListing:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
} 