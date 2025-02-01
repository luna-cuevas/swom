import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { logMemberAction } from "@/lib/logging";

export async function PUT(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const { user_info, home_info, amenities, ids } = await request.json();

    // Update user_info
    const { error: userInfoError, data: userInfoData } = await supabase
      .from("user_info")
      .update({
        name: user_info.name,
        email: user_info.email,
        phone: user_info.phone,
        age: user_info.age,
        profession: user_info.profession,
        about_me: user_info.about_me,
        children: user_info.children,
        recommended: user_info.recommended,
        open_to_other_cities: user_info.open_to_other_cities,
        open_to_other_destinations: user_info.open_to_other_destinations,
        profile_image_url: user_info.profile_image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ids.user_info_id)
      .select();

    if (userInfoError) throw userInfoError;

    // Update home_info
    const { error: homeInfoError, data: homeInfoData } = await supabase
      .from("home_info")
      .update({
        title: home_info.title,
        property_type: home_info.property_type,
        description: home_info.description,
        located_in: home_info.located_in,
        bathrooms: home_info.bathrooms,
        area: home_info.area,
        main_or_second: home_info.main_or_second,
        city: home_info.city,
        how_many_sleep: home_info.how_many_sleep,
        address: {
          lat: home_info.address.lat,
          lng: home_info.address.lng,
          query: home_info.address.query
        },
        listing_images: home_info.listing_images,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ids.home_info_id)
      .select();

    if (homeInfoError) throw homeInfoError;

    // Update amenities
    const { error: amenitiesError, data: amenitiesData } = await supabase
      .from("amenities")
      .update({
        ...amenities,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ids.amenities_id)
      .select();

    if (amenitiesError) throw amenitiesError;

    // update listing updated_at
    const { error: listingError, data: listingData } = await supabase
      .from("listings")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", ids.listing_id)
      .select();

    if (listingError) throw listingError;

    // Log the update action
    await logMemberAction(supabase, ids.user_id, "update_listing", {
      listing_id: ids.listing_id,
      listing_title: home_info.title,
      updated_fields: {
        user_info: Object.keys(user_info).filter(key => user_info[key] !== undefined),
        home_info: Object.keys(home_info).filter(key => home_info[key] !== undefined),
        amenities: Object.keys(amenities).filter(key => amenities[key] !== undefined),
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        user_info: userInfoData?.[0],
        home_info: homeInfoData?.[0],
        amenities: amenitiesData?.[0],
      },
    });
  } catch (error: any) {
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update listing" },
      { status: 500 }
    );
  }
} 