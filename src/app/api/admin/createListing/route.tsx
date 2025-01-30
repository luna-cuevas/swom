import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const { user_info, home_info, amenities, options } = await req.json();

    // Generate a slug from the title
    const slug = home_info.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Always look up the user first to get their ID
    const { data: existingUser } = await supabase
      .from("appUsers")
      .select("id")
      .eq("email", user_info.email)
      .single();

    let userId;

    if (existingUser) {
      userId = existingUser.id;
    } else if (!options.setSubscribed) {
      // Only create new user if not setting as subscribed
      const { data: userData, error: userError } =
        await supabase.auth.admin.createUser({
          email: user_info.email,
          password: crypto.randomUUID(),
          user_metadata: {
            name: user_info.name,
            phone: user_info.phone,
            role: "member",
            dob: user_info.dob || "",
            profession: user_info.profession || "",
          },
          email_confirm: true,
        });

      if (userError) {
        console.error("Error creating user:", userError);
        throw userError;
      }

      userId = userData.user.id;
    } else {
      throw new Error(
        "User does not exist. Cannot create listing without a user."
      );
    }

    // Insert user info
    const { data: userInfoData, error: userInfoError } = await supabase
      .from("user_info")
      .insert({
        name: user_info.name,
        email: user_info.email,
        phone: user_info.phone,
        profession: user_info.profession,
        age: user_info.age,
        dob: user_info.dob,
        about_me: user_info.about_me,
        children: user_info.children,
        recommended: user_info.recommended,
        open_to_other_cities: user_info.open_to_other_cities,
        open_to_other_destinations: user_info.open_to_other_destinations,
      })
      .select()
      .single();

    if (userInfoError) throw userInfoError;

    // Insert home info with location data
    const { data: homeInfoData, error: homeInfoError } = await supabase
      .from("home_info")
      .insert({
        title: home_info.title,
        city: home_info.city,
        description: home_info.description,
        property_type: home_info.property_type,
        how_many_sleep: home_info.how_many_sleep,
        bathrooms: home_info.bathrooms,
        area: home_info.area,
        located_in: home_info.located_in,
        main_or_second: home_info.main_or_second,
        address: home_info.address,
        listing_images: home_info.listing_images || [],
      })
      .select()
      .single();

    if (homeInfoError) throw homeInfoError;

    // Insert amenities
    const { data: amenitiesData, error: amenitiesError } = await supabase
      .from("amenities")
      .insert({
        bike: Boolean(amenities.bike),
        car: Boolean(amenities.car),
        tv: Boolean(amenities.tv),
        dishwasher: Boolean(amenities.dishwasher),
        pingpong: Boolean(amenities.pingpong),
        billiards: Boolean(amenities.billiards),
        washer: Boolean(amenities.washer),
        dryer: Boolean(amenities.dryer),
        wifi: Boolean(amenities.wifi),
        elevator: Boolean(amenities.elevator),
        terrace: Boolean(amenities.terrace),
        scooter: Boolean(amenities.scooter),
        bbq: Boolean(amenities.bbq),
        computer: Boolean(amenities.computer),
        wc_access: Boolean(amenities.wcAccess),
        pool: Boolean(amenities.pool),
        playground: Boolean(amenities.playground),
        baby_gear: Boolean(amenities.babyGear),
        ac: Boolean(amenities.ac),
        fireplace: Boolean(amenities.fireplace),
        parking: Boolean(amenities.parking),
        hot_tub: Boolean(amenities.hotTub),
        sauna: Boolean(amenities.sauna),
        other: Boolean(amenities.other),
        doorman: Boolean(amenities.doorman),
        cleaning_service: Boolean(amenities.cleaningService),
        video_games: Boolean(amenities.videoGames),
        tennis_court: Boolean(amenities.tennisCourt),
        gym: Boolean(amenities.gym),
      })
      .select()
      .single();

    if (amenitiesError) throw amenitiesError;

    // Create listing entry
    const { data: listingData, error: listingError } = await supabase
      .from("listings")
      .insert({
        user_id: userId, // Now we always have a user ID
        email: user_info.email,
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
      })
      .select()
      .single();

    if (listingError) throw listingError;

    // Only create appUser and send emails if not setSubscribed
    if (!options.setSubscribed) {
      // Create entry in appUsers table
      const { error: appUserError } = await supabase.from("appUsers").insert({
        id: userId,
        name: user_info.name,
        email: user_info.email,
        role: "member",
        profession: user_info.profession || "",
        age: user_info.age || "",
        profileImage: "",
        favorites: [],
        privacyPolicy: "accepted",
        privacyPolicyDate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        subscribed: options.setSubscribed,
      });

      if (appUserError) throw appUserError;

      // Send welcome email if requested
      if (options.sendWelcomeEmail) {
        // Send template 1 (approval email)
        const approvalEmailResponse = await fetch(
          `${process.env.BASE_URL}/api/admin/sendBrevoTemplate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user_info.email,
              templateId: 1,
              params: {
                name: user_info.name,
              },
            }),
          }
        );

        if (!approvalEmailResponse.ok) {
          console.error(
            "Failed to send approval email:",
            await approvalEmailResponse.json()
          );
        }

        // Send template 3 (sign-up email)
        const resetUrl =
          process.env.NODE_ENV === "development"
            ? `http://localhost:3000/sign-up?email=${user_info.email}`
            : `https://swom.travel/sign-up?email=${user_info.email}`;

        const signupEmailResponse = await fetch(
          `${process.env.BASE_URL}/api/admin/sendBrevoTemplate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user_info.email,
              templateId: 3,
              params: {
                name: user_info.name,
                url: resetUrl,
              },
            }),
          }
        );

        if (!signupEmailResponse.ok) {
          console.error(
            "Failed to send signup email:",
            await signupEmailResponse.json()
          );
        }
      }
    }

    return NextResponse.json({ success: true, listing: listingData });
  } catch (error: any) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create listing" },
      { status: 500 }
    );
  }
}
