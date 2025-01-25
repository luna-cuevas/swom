import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

interface AddressInfo {
  lat: number;
  lng: number;
  query: string;
}

interface HomeInfo {
  id: string;
  title: string;
  city: string;
  description: string;
  listing_images: string[];
  address: AddressInfo;
  property_type: string;
  how_many_sleep: number;
  located_in: string;
  bathrooms: number;
  area: string;
  main_or_second: string;
  created_at: string;
  updated_at: string;
  submission_id: string;
}

interface UserInfo {
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
  open_to_other_cities: string[];
  open_to_other_destinations: boolean;
  created_at: string;
  updated_at: string;
  submission_id: string;
}

interface Amenities {
  id: string;
  bike: boolean;
  car: boolean;
  tv: boolean;
  dishwasher: boolean;
  pingpong: boolean;
  billiards: boolean;
  washer: boolean;
  dryer: boolean;
  wifi: boolean;
  elevator: boolean;
  terrace: boolean;
  scooter: boolean;
  bbq: boolean;
  computer: boolean;
  wc_access: boolean;
  pool: boolean;
  playground: boolean;
  baby_gear: boolean;
  ac: boolean;
  fireplace: boolean;
  parking: boolean;
  hot_tub: boolean;
  sauna: boolean;
  other: boolean;
  doorman: boolean;
  cleaning_service: boolean;
  video_games: boolean;
  tennis_court: boolean;
  gym: boolean;
  created_at: string;
  updated_at: string;
  submission_id: string;
}

interface Listing {
  id: string;
  user_id: string;
  user_info_id: string;
  home_info_id: string;
  amenities_id: string;
  highlight_tag: string;
  slug: string;
  privacy_policy_accepted: boolean;
  privacy_policy_date: string;
  created_at: string;
  updated_at: string;
  is_highlighted: boolean;
  status: string;
  highlighted_order_rank: number;
  global_order_rank: number;
  home_info: HomeInfo;
  user_info: UserInfo;
  amenities: Amenities;
}

interface TransformedListing extends Omit<Listing, "home_info"> {
  home_info: HomeInfo & {
    lat?: number;
    lng?: number;
  };
}

interface ListingWithFavorite extends TransformedListing {
  favorite: boolean;
}

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");
    console.log(id);

    if (!id && !email) {
      return NextResponse.json(
        { error: "Either listing ID or email is required" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("listings")
      .select(
        `
        id,
        user_id,
        user_info_id,
        home_info_id,
        amenities_id,
        highlight_tag,
        slug,
        privacy_policy_accepted,
        privacy_policy_date,
        created_at,
        updated_at,
        is_highlighted,
        status,
        highlighted_order_rank,
        global_order_rank,
        email,
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
          main_or_second,
          created_at,
          updated_at,
          submission_id
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
          created_at,
          updated_at,
          submission_id
        ),
        amenities:amenities_id(*)
      `
      )
      .in("status", ["archived", "approved"]);

    if (id) {
      query = query.eq("id", id);
    } else if (email) {
      query = query.eq("email", email);
    }

    const { data: listings, error: listingError } = await query;

    if (listingError) throw listingError;

    if (!listings || listings.length === 0) {
      return NextResponse.json({ error: "No listings found" }, { status: 404 });
    }

    // Transform the listings to include lat/lng from address
    const transformedListings = listings.map((listing: any) => ({
      ...listing,
      home_info: {
        ...listing.home_info,
        lat: listing.home_info.address?.lat,
        lng: listing.home_info.address?.lng,
      },
    }));

    // Check if the user has an active subscription
    const { data: appUser } = await supabase
      .from("appUsers")
      .select("subscribed, favorites")
      .eq("email", email)
      .single();

    if (!appUser?.subscribed) {
      return NextResponse.json(
        { error: "Listing not available" },
        { status: 403 }
      );
    }

    // Add favorite status to the listings
    const listingsWithFavorites = transformedListings.map((listing: any) => ({
      ...listing,
      favorite:
        appUser.favorites?.some(
          (fav: { listingId: string }) => fav.listingId === listing.id
        ) || false,
    }));

    // If ID was provided, return single listing, otherwise return array
    const response = id ? listingsWithFavorites[0] : listingsWithFavorites;
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}
