import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const { formData, imageFilesData, captchaToken, whereIsIt } = await req.json();

    if (!formData.privacyPolicy) {
      return NextResponse.json(
        { error: "You must agree to the privacy policy." },
        { status: 400 }
      );
    }

    if (!imageFilesData || imageFilesData.length === 0) {
      return NextResponse.json(
        { error: "Please upload at least one image" },
        { status: 400 }
      );
    }

    if (!captchaToken) {
      return NextResponse.json(
        { error: "Please complete the captcha" },
        { status: 400 }
      );
    }

    // Generate a unique ID for this submission
    const submissionId = crypto.randomUUID();

    // Upload Images to Supabase Storage
    const imageUrls = await Promise.all(
      imageFilesData.map(async (fileData: { base64: string, name: string }) => {
        const fileExt = fileData.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `public/${submissionId}/${fileName}`;

        // Convert base64 to buffer
        const buffer = Buffer.from(fileData.base64.split(',')[1], 'base64');

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(filePath, buffer, {
            contentType: `image/${fileExt}`
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(filePath);

        return publicUrl;
      })
    );

    // Create user_info record
    const { data: userInfoData, error: userInfoError } = await supabase
      .from('user_info')
      .insert({
        submission_id: submissionId,
        email: formData.userInfo.email,
        name: formData.userInfo.name,
        dob: formData.userInfo.dob,
        phone: formData.userInfo.phone,
        profession: formData.userInfo.profession,
        about_me: formData.userInfo.about_me,
        children: formData.userInfo.children,
        recommended: formData.userInfo.recommended,
        open_to_other_cities: formData.userInfo.openToOtherCities,
        open_to_other_destinations: formData.userInfo.openToOtherDestinations
      })
      .select()
      .single();

    if (userInfoError) throw userInfoError;

    // Create home_info record
    const { data: homeInfoData, error: homeInfoError } = await supabase
      .from('home_info')
      .insert({
        submission_id: submissionId,
        title: formData.homeInfo.title,
        property_type: formData.homeInfo.property,
        description: formData.homeInfo.description,
        located_in: formData.homeInfo.locatedIn,
        bathrooms: parseInt(formData.homeInfo.bathrooms),
        area: formData.homeInfo.area,
        main_or_second: formData.homeInfo.mainOrSecond,
        address: { lat: whereIsIt.lat, lng: whereIsIt.lng, query: whereIsIt.query },
        city: whereIsIt.query,
        how_many_sleep: parseInt(formData.homeInfo.howManySleep),
        listing_images: imageUrls
      })
      .select()
      .single();

    if (homeInfoError) throw homeInfoError;

    // Create amenities record
    const { data: amenitiesData, error: amenitiesError } = await supabase
      .from('amenities')
      .insert({
        submission_id: submissionId,
        bike: formData.amenities.bike,
        car: formData.amenities.car,
        tv: formData.amenities.tv,
        dishwasher: formData.amenities.dishwasher,
        pingpong: formData.amenities.pingpong,
        billiards: formData.amenities.billiards,
        washer: formData.amenities.washer,
        dryer: formData.amenities.dryer,
        wifi: formData.amenities.wifi,
        elevator: formData.amenities.elevator,
        terrace: formData.amenities.terrace,
        scooter: formData.amenities.scooter,
        bbq: formData.amenities.bbq,
        computer: formData.amenities.computer,
        wc_access: formData.amenities.wcAccess,
        pool: formData.amenities.pool,
        playground: formData.amenities.playground,
        baby_gear: formData.amenities.babyGear,
        ac: formData.amenities.ac,
        fireplace: formData.amenities.fireplace,
        parking: formData.amenities.parking,
        hot_tub: formData.amenities.hotTub,
        sauna: formData.amenities.sauna,
        other: formData.amenities.other,
        doorman: formData.amenities.doorman,
        cleaning_service: formData.amenities.cleaningService,
        video_games: formData.amenities.videoGames,
        tennis_court: formData.amenities.tennisCourt,
        gym: formData.amenities.gym
      })
      .select()
      .single();

    if (amenitiesError) throw amenitiesError;

    // Create needs_approval record
    const { error: approvalError } = await supabase
      .from('needs_approval')
      .insert({
        submission_id: submissionId,
        user_info_id: userInfoData.id,
        home_info_id: homeInfoData.id,
        amenities_id: amenitiesData.id,
        privacy_policy_accepted: true,
        privacy_policy_date: new Date().toISOString(),
        status: 'pending'
      });

    if (approvalError) throw approvalError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: error.message || "An error occurred while submitting the form" },
      { status: 500 }
    );
  }
} 