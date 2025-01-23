import { NextResponse } from "next/server";
import { sanityClient } from "../../../../sanity/lib/client";
import { getSupabaseClient } from "@/utils/supabaseClient";
import { Client } from "@googlemaps/google-maps-services-js";
import type { AddressType } from "@googlemaps/google-maps-services-js";

export async function POST(req: Request, res: Response) {
  try {
    const supabase = getSupabaseClient();
    const body = await req.json();
    const email = body.email;
    const id = body.id;
    const query = body.query;

    // Initialize Google Maps client
    const googleMapsClient = new Client({});

    if (email && !query) {
      const data = await sanityClient.fetch(
        `*[_type == 'listing' && userInfo.email == $email]`,
        {
          email,
        }
      );

      if (!data) {
        return NextResponse.json({ error: "No data found" }, { status: 404 });
      }

      return NextResponse.json(data);
    } else {
      let listings = await sanityClient.fetch(query);

      if (!listings || !Array.isArray(listings)) {
        return NextResponse.json(
          { error: "Invalid listings data" },
          { status: 400 }
        );
      }

      console.log("Listings:", listings.length);

      let updatedListings = await Promise.all(
        listings.map(async (listing: any) => {
          const { lat, lng } =
            listing.homeInfo.address !== undefined
              ? listing.homeInfo.address
              : { lat: 0, lng: 0 };

          try {
            if (lat === 0 && lng === 0) {
              return listing;
            }

            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
              console.error("Google Maps API key not found");
              return listing;
            }

            const response = await googleMapsClient.geocode({
              params: {
                address: `${lat},${lng}`,
                key: apiKey,
              },
            });

            const results = response.data.results[0];
            if (results) {
              const addressComponents = results.address_components;
              let city = "",
                country = "";

              for (const component of addressComponents) {
                const types = component.types as AddressType[];
                if (types.includes("locality" as AddressType)) {
                  city = component.long_name;
                } else if (types.includes("country" as AddressType)) {
                  country = component.long_name;
                }
              }

              return { ...listing, city, country };
            }
            return listing;
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
            return listing;
          }
        })
      );

      if (id) {
        try {
          const { data: user, error: userError } = await supabase
            .from("appUsers")
            .select("favorites")
            .eq("id", id);

          if (userError) {
            console.error("Error fetching user favorites:", userError);
          } else if (user[0]?.favorites?.length > 0) {
            const favoriteIds = user[0].favorites.map(
              (fav: any) => fav.listingId
            );
            updatedListings = updatedListings.map((listing: any) => ({
              ...listing,
              favorite: favoriteIds.includes(listing._id),
            }));
          }
        } catch (error) {
          console.error("Error processing favorites:", error);
        }
      }

      return NextResponse.json(updatedListings);
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
