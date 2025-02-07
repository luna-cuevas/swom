import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/logging";

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const listing = await request.json();
    const { id, home_info, user_info, amenities, slug, adminId } = listing;

    if (!adminId) {
      return NextResponse.json({ error: "Missing admin ID" }, { status: 400 });
    }

    console.log("Received data:", {
      listingId: id,
      homeInfoId: home_info?.id,
      userInfoId: user_info?.id,
      amenitiesId: amenities?.id,
    });

    const missingIds = [];
    if (!id) missingIds.push("listing id");
    if (!home_info?.id) missingIds.push("home_info id");
    if (!user_info?.id) missingIds.push("user_info id");
    if (!amenities?.id) missingIds.push("amenities id");

    if (missingIds.length > 0) {
      throw new Error(`Missing required IDs: ${missingIds.join(", ")}`);
    }

    // Get original listing data for logging changes
    const { data: originalListing, error: fetchError } = await supabase
      .from(listing.status === "pending" ? "needs_approval" : "listings")
      .select(
        `
        *,
        home_info:home_info_id(*),
        user_info:user_info_id(*),
        amenities:amenities_id(*)
      `
      )
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching original listing:", fetchError);
      throw fetchError;
    }

    // Update home_info
    const { error: homeError } = await supabase
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
        address: home_info.address,
      })
      .eq("id", home_info.id);

    if (homeError) {
      console.error("Home info update error:", homeError);
      throw homeError;
    }

    // Update user_info
    const { error: userError } = await supabase
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
      })
      .eq("id", user_info.id);

    if (userError) {
      console.error("User info update error:", userError);
      throw userError;
    }

    // Update amenities
    const { error: amenitiesError } = await supabase
      .from("amenities")
      .update({
        bike: amenities.bike,
        car: amenities.car,
        tv: amenities.tv,
        dishwasher: amenities.dishwasher,
        pingpong: amenities.pingpong,
        billiards: amenities.billiards,
        washer: amenities.washer,
        dryer: amenities.dryer,
        wifi: amenities.wifi,
        elevator: amenities.elevator,
        terrace: amenities.terrace,
        scooter: amenities.scooter,
        bbq: amenities.bbq,
        computer: amenities.computer,
        wc_access: amenities.wc_access,
        pool: amenities.pool,
        playground: amenities.playground,
        baby_gear: amenities.baby_gear,
        ac: amenities.ac,
        fireplace: amenities.fireplace,
        parking: amenities.parking,
        hot_tub: amenities.hot_tub,
        sauna: amenities.sauna,
        other: amenities.other,
        doorman: amenities.doorman,
        cleaning_service: amenities.cleaning_service,
        video_games: amenities.video_games,
        tennis_court: amenities.tennis_court,
        gym: amenities.gym,
      })
      .eq("id", amenities.id);

    if (amenitiesError) {
      console.error("Amenities update error:", amenitiesError);
      throw amenitiesError;
    }

    // Update slug in needs_approval or listings table based on status
    const table = listing.status === "pending" ? "needs_approval" : "listings";
    const { error: slugError } = await supabase
      .from(table)
      .update({ slug })
      .eq("id", id);

    if (slugError) {
      console.error("Slug update error:", slugError);
      throw slugError;
    }

    // Log the listing update with changes
    interface Change {
      from: any;
      to: any;
    }

    interface Changes {
      home_info?: { [key: string]: Change };
      user_info?: { [key: string]: Change };
      amenities?: { [key: string]: Change };
      slug?: Change;
    }

    const changes: Changes = {};

    // Track home_info changes
    const homeInfoChanges: { [key: string]: Change } = {};
    Object.keys(home_info).forEach((key) => {
      if (key !== "id" && home_info[key] !== originalListing.home_info[key]) {
        homeInfoChanges[key] = {
          from: originalListing.home_info[key],
          to: home_info[key],
        };
      }
    });
    if (Object.keys(homeInfoChanges).length > 0) {
      changes.home_info = homeInfoChanges;
    }

    // Track user_info changes
    const userInfoChanges: { [key: string]: Change } = {};
    Object.keys(user_info).forEach((key) => {
      if (key !== "id" && user_info[key] !== originalListing.user_info[key]) {
        userInfoChanges[key] = {
          from: originalListing.user_info[key],
          to: user_info[key],
        };
      }
    });
    if (Object.keys(userInfoChanges).length > 0) {
      changes.user_info = userInfoChanges;
    }

    // Track amenities changes
    const amenitiesChanges: { [key: string]: Change } = {};
    Object.keys(amenities).forEach((key) => {
      if (key !== "id" && amenities[key] !== originalListing.amenities[key]) {
        amenitiesChanges[key] = {
          from: originalListing.amenities[key],
          to: amenities[key],
        };
      }
    });
    if (Object.keys(amenitiesChanges).length > 0) {
      changes.amenities = amenitiesChanges;
    }

    // Track slug changes
    if (slug !== originalListing.slug) {
      changes.slug = {
        from: originalListing.slug,
        to: slug,
      };
    }

    console.log("Logging changes:", changes);

    await logAdminAction(supabase, adminId, "update_listing", {
      listing_id: id,
      listing_title: home_info.title,
      user_email: user_info.email,
      table: table,
      changes,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update listing" },
      { status: 500 }
    );
  }
}
