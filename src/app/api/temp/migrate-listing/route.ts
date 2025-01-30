import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import createImageUrlBuilder from '@sanity/image-url';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const imageBuilder = createImageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET as string,
});

function processImageUrl(imageRef: string) {
  try {
    console.log("Processing image ref:", imageRef);
    // Create a Sanity image source object from the reference
    const source = {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: imageRef
      }
    };

    // Use the image builder to generate the URL
    const finalUrl = imageBuilder.image(source).auto('format').fit('max').url();
    console.log("Generated image URL:", finalUrl);
    return finalUrl;
  } catch (error) {
    console.error("Error processing image URL:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const sanityListing = await request.json();

    // Check if user exists in auth.users using admin API
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      console.error("Error checking user:", userError);
      return NextResponse.json(
        { error: "Error checking user in auth: " + userError.message },
        { status: 500 }
      );
    }

    console.log("Looking for email:", sanityListing.userInfo.email);
    console.log("Available users:", users.map(u => ({ id: u.id, email: u.email })));

    const user = users.find(u => u.email?.toLowerCase() === sanityListing.userInfo.email?.toLowerCase());

    if (!user) {
      console.log("No user found for email:", sanityListing.userInfo.email);
      // If user doesn't exist in auth, we should skip this listing
      return NextResponse.json(
        { error: `User not found in auth for email: ${sanityListing.userInfo.email}. They need to sign up first.` },
        { status: 400 }
      );
    }

    console.log("Found user:", { id: user.id, email: user.email });
    const userId = user.id;

    // First, get existing appUser data if it exists
    const { data: existingAppUser, error: existingAppUserError } = await supabase
      .from("appUsers")
      .select("*")
      .eq("id", userId)
      .single();

    if (existingAppUserError && existingAppUserError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error("Error fetching existing appUser:", existingAppUserError);
      return NextResponse.json(
        { error: "Error fetching existing appUser: " + existingAppUserError.message },
        { status: 500 }
      );
    }

    // Process profile image from Sanity
    let profileImageUrl = null;
    if (sanityListing.userInfo.profileImage?.asset?._ref) {
      console.log("Processing profile image with ref:", sanityListing.userInfo.profileImage.asset._ref);
      profileImageUrl = processImageUrl(sanityListing.userInfo.profileImage.asset._ref);
      console.log("Final profile image URL:", profileImageUrl);
    } else {
      console.log("No profile image found in Sanity data");
    }

    // Merge existing data with new data, preferring Sanity data when available
    const appUserData = {
      id: userId,
      email: sanityListing.userInfo.email,
      name: sanityListing.userInfo.name || existingAppUser?.name,
      profession: sanityListing.userInfo.profession || existingAppUser?.profession,
      age: sanityListing.userInfo.age?.toString() || existingAppUser?.age,
      role: existingAppUser?.role || 'user',
      profileImage: profileImageUrl || existingAppUser?.profileImage,
      favorites: existingAppUser?.favorites || [],
      privacyPolicy: existingAppUser?.privacyPolicy || 'accepted',
      privacyPolicyDate: existingAppUser?.privacyPolicyDate || new Date().toISOString(),
      created_at: existingAppUser?.created_at || new Date().toISOString(),
      subscribed: existingAppUser?.subscribed !== undefined ? existingAppUser.subscribed : true,
      subscription_id: existingAppUser?.subscription_id,
      stripe_customer_id: existingAppUser?.stripe_customer_id,
    };

    // Insert or update appUsers record
    const { data: appUser, error: appUserError } = await supabase
      .from("appUsers")
      .upsert(appUserData)
      .select()
      .single();

    if (appUserError) {
      console.error("Error upserting appUser:", appUserError);
      return NextResponse.json(
        { error: "Error upserting appUser: " + appUserError.message },
        { status: 500 }
      );
    }

    // Transform the Sanity listing data to match Supabase schema
    const transformedData = {
      user_info: {
        name: sanityListing.userInfo.name,
        email: sanityListing.userInfo.email,
        phone: sanityListing.userInfo.phone,
        profession: sanityListing.userInfo.profession,
        age: sanityListing.userInfo.age,
        dob: sanityListing.userInfo.dob,
        about_me: sanityListing.userInfo.about_me,
        children: sanityListing.userInfo.children,
        recommended: sanityListing.userInfo.recommended,
        open_to_other_cities: sanityListing.userInfo.openToOtherCities?.cityVisit1
          ? [sanityListing.userInfo.openToOtherCities.cityVisit1]
          : [],
        open_to_other_destinations: sanityListing.userInfo.openToOtherDestinations,
      },
      home_info: {
        title: sanityListing.homeInfo.title,
        city: sanityListing.homeInfo.city,
        description: sanityListing.homeInfo.description,
        property_type: sanityListing.homeInfo.property,
        how_many_sleep: sanityListing.homeInfo.howManySleep,
        bathrooms: sanityListing.homeInfo.bathrooms,
        area: sanityListing.homeInfo.area,
        located_in: sanityListing.homeInfo.locatedIn,
        main_or_second: sanityListing.homeInfo.mainOrSecond,
        address: {
          lat: sanityListing.homeInfo.address.lat,
          lng: sanityListing.homeInfo.address.lng,
        },
        listing_images: (sanityListing.homeInfo.listingImages || [])
          .filter((img: any) => {
            const hasAsset = Boolean(img?.asset?._ref);
            if (!hasAsset) console.log("Skipping listing image without asset ref:", img);
            return hasAsset;
          })
          .map((img: any) => {
            console.log("Processing listing image with ref:", img.asset._ref);
            return processImageUrl(img.asset._ref);
          })
          .filter(Boolean) || [],
      },
      amenities: {
        bike: Boolean(sanityListing.amenities?.bike),
        car: Boolean(sanityListing.amenities?.car),
        tv: Boolean(sanityListing.amenities?.tv),
        dishwasher: Boolean(sanityListing.amenities?.dishwasher),
        pingpong: Boolean(sanityListing.amenities?.pingpong),
        billiards: Boolean(sanityListing.amenities?.billiards),
        washer: Boolean(sanityListing.amenities?.washer),
        dryer: Boolean(sanityListing.amenities?.dryer),
        wifi: Boolean(sanityListing.amenities?.wifi),
        elevator: Boolean(sanityListing.amenities?.elevator),
        terrace: Boolean(sanityListing.amenities?.terrace),
        scooter: Boolean(sanityListing.amenities?.scooter),
        bbq: Boolean(sanityListing.amenities?.bbq),
        computer: Boolean(sanityListing.amenities?.computer),
        wc_access: Boolean(sanityListing.amenities?.wc_access),
        pool: Boolean(sanityListing.amenities?.pool),
        playground: Boolean(sanityListing.amenities?.playground),
        baby_gear: Boolean(sanityListing.amenities?.baby_gear),
        ac: Boolean(sanityListing.amenities?.ac),
        fireplace: Boolean(sanityListing.amenities?.fireplace),
        parking: Boolean(sanityListing.amenities?.parking),
        hot_tub: Boolean(sanityListing.amenities?.hot_tub),
        sauna: Boolean(sanityListing.amenities?.sauna),
        doorman: Boolean(sanityListing.amenities?.doorman),
        cleaning_service: Boolean(sanityListing.amenities?.cleaning_service),
        video_games: Boolean(sanityListing.amenities?.video_games),
        tennis_court: Boolean(sanityListing.amenities?.tennis_court),
        gym: Boolean(sanityListing.amenities?.gym),
        other: sanityListing.amenities?.other || false,
      },
      user_email: sanityListing.userInfo.email,
    };

    // Insert user info
    const { data: userInfoData, error: userInfoError } = await supabase
      .from("user_info")
      .insert(transformedData.user_info)
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
      .insert(transformedData.home_info)
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
      .insert(transformedData.amenities)
      .select()
      .single();

    if (amenitiesError) {
      console.error("Error inserting amenities:", amenitiesError);
      return NextResponse.json(
        { error: "Error inserting amenities: " + amenitiesError.message },
        { status: 500 }
      );
    }

    // Use existing Sanity slug if available, otherwise generate from title
    const slug = sanityListing.slug?.current ||
      transformedData.home_info.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    // Create the listing with references to other tables
    console.log("Creating listing with data:", {
      user_id: userId,
      email: transformedData.user_email,
      user_info_id: userInfoData.id,
      home_info_id: homeInfoData.id,
      amenities_id: amenitiesData.id,
      slug: slug
    });

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .insert([
        {
          user_id: userId,
          email: transformedData.user_email,
          user_info_id: userInfoData.id,
          home_info_id: homeInfoData.id,
          amenities_id: amenitiesData.id,
          status: "approved",
          slug: slug,
          created_at: new Date().toISOString(),
          is_highlighted: Boolean(sanityListing.highlightTag),
          privacy_policy_accepted: true,
          privacy_policy_date: new Date().toISOString(),
          global_order_rank: parseInt(sanityListing.orderRank?.split(":")[0].split("|")[1]) || 0,
          highlighted_order_rank: sanityListing.highlightTag ? 0 : null,
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

    return NextResponse.json({ success: true, listing });
  } catch (error: any) {
    console.error("Error in migrateListing:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
} 