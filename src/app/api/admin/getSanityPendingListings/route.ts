import { createClient } from "next-sanity";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { apiVersion, dataset, projectId, authToken as token, useCdn } from "../../../../../sanity/env";

export async function GET() {
  try {
    // Initialize Sanity client
    const sanityClient = createClient({
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn,
    });

    // Initialize Supabase client
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    // First get all Sanity listings
    const query = `*[_type == "needsApproval" && !defined(^._id) && !(_id in path("drafts.**"))] {
      _id,
      slug,
      userInfo {
        name,
        email,
        phone,
        profession,
        about_me,
        dob,
        age,
        children,
        recommended,
        open_to_other_cities,
        open_to_other_destinations,
        profileImage
      },
      homeInfo {
        title,
        city,
        description,
        property_type,
        how_many_sleep,
        located_in,
        bathrooms,
        area,
        main_or_second,
        address,
        images
      },
      amenities {
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
      },
      privacyPolicy {
        accepted,
        date
      }
    }`;

    const sanityListings = await sanityClient.fetch(query);

    // Get all user emails from Sanity listings
    const sanityEmails = sanityListings.map((listing: any) => listing.userInfo.email);

    // Check which emails already exist in Supabase needs_approval table
    const { data: existingUsers } = await supabase
      .from("user_info")
      .select("email")
      .in("email", sanityEmails);

    const existingEmails = new Set(existingUsers?.map(user => user.email) || []);

    // Filter out listings that have already been migrated
    const pendingListings = sanityListings.filter(
      (listing: any) => !existingEmails.has(listing.userInfo.email)
    );

    return NextResponse.json(pendingListings);
  } catch (error: any) {
    console.error("Error fetching Sanity pending listings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Sanity pending listings" },
      { status: 500 }
    );
  }
} 