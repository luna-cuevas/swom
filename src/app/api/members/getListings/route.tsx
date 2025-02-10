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
  favorite?: boolean;
}

interface TransformedListing extends Omit<Listing, "home_info"> {
  home_info: HomeInfo & {
    lat: number | null;
    lng: number | null;
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
    // Get pagination and search parameters from URL
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "9");
    const searchQuery = url.searchParams.get("search") || "";
    const userId = url.searchParams.get("userId");
    const start = (page - 1) * limit;

    // First get all listings to apply search filter
    const { data: listings, error: listingsError } = await supabase
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
      .eq("status", "published")
      .order("global_order_rank", { ascending: true })
      .returns<Listing[]>();

    if (listingsError) throw listingsError;

    // Transform listings to include lat/lng from address
    const transformedListings = listings!.map((listing: Listing) => ({
      ...listing,
      home_info: {
        ...listing.home_info,
        lat: (listing.home_info as HomeInfo).address?.lat || null,
        lng: (listing.home_info as HomeInfo).address?.lng || null,
      },
    }));

    // Filter listings based on search query
    let filteredBySearch = transformedListings;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredBySearch = transformedListings.filter(
        (listing) =>
          listing.home_info.title?.toLowerCase().includes(query) ||
          listing.home_info.city?.toLowerCase().includes(query) ||
          listing.home_info.description?.toLowerCase().includes(query) ||
          listing.home_info.located_in?.toLowerCase().includes(query)
      );
    }

    // Filter listings to only include those where the user has an active subscription
    const listingsWithActiveSubs = await Promise.all(
      filteredBySearch.map(async (listing) => {
        const { data: appUser } = await supabase
          .from("appUsers")
          .select("subscribed, favorites")
          .eq("email", listing.user_info.email)
          .single();

        if (!appUser?.subscribed) return null;

        // Get the current user's favorites if userId is provided
        let userFavorites = [];
        if (userId) {
          const { data: currentUser } = await supabase
            .from("appUsers")
            .select("favorites")
            .eq("id", userId)
            .single();

          // Handle the favorites array correctly
          userFavorites = currentUser?.favorites || [];
          if (!Array.isArray(userFavorites)) {
            userFavorites = [];
          }
        }

        // Add favorite status to the listing based on the current user's favorites
        return {
          ...listing,
          favorite:
            Array.isArray(userFavorites) &&
            userFavorites.some((fav) => fav?.listingId === listing.id),
        };
      })
    );

    // Remove null entries (listings without active subscriptions)
    const finalFilteredListings = listingsWithActiveSubs.filter(
      (listing): listing is ListingWithFavorite => listing !== null
    );

    // Calculate pagination for filtered results
    const totalFilteredCount = finalFilteredListings.length;
    const totalPages = Math.ceil(totalFilteredCount / limit);
    const paginatedListings = finalFilteredListings.slice(start, start + limit);

    return NextResponse.json({
      listings: paginatedListings,
      totalCount: totalFilteredCount,
      currentPage: page,
      totalPages,
      isFiltered: searchQuery !== "",
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
