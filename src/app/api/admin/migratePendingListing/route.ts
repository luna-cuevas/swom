import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createSanityClient } from "next-sanity";
import { apiVersion, dataset, projectId, authToken as token, useCdn } from "../../../../../sanity/env";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const listing = await request.json();
    const submissionId = uuidv4(); // Generate a UUID to use across all tables

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    // Initialize Sanity client
    const sanityClient = createSanityClient({
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn,
    });

    try {
      // Insert user info
      const { data: userInfo, error: userError } = await supabase
        .from("user_info")
        .insert({
          email: listing.userInfo.email,
          name: listing.userInfo.name,
          phone: listing.userInfo.phone,
          profession: listing.userInfo.profession,
          about_me: listing.userInfo.about_me,
          dob: listing.userInfo.dob,
          age: listing.userInfo.age,
          children: listing.userInfo.children,
          recommended: listing.userInfo.recommended,
          open_to_other_cities: listing.userInfo.open_to_other_cities,
          open_to_other_destinations: listing.userInfo.open_to_other_destinations,
          profile_image_url: listing.userInfo.profileImage,
          submission_id: submissionId,
        })
        .select()
        .single();

      if (userError) throw userError;

      // Insert home info
      const { data: homeInfo, error: homeError } = await supabase
        .from("home_info")
        .insert({
          title: listing.homeInfo.title,
          city: listing.homeInfo.city,
          description: listing.homeInfo.description,
          listing_images: listing.homeInfo.images,
          address: listing.homeInfo.address,
          property_type: listing.homeInfo.property_type,
          how_many_sleep: listing.homeInfo.how_many_sleep,
          located_in: listing.homeInfo.located_in,
          bathrooms: listing.homeInfo.bathrooms,
          area: listing.homeInfo.area,
          main_or_second: listing.homeInfo.main_or_second,
          submission_id: submissionId,
        })
        .select()
        .single();

      if (homeError) throw homeError;

      // Insert amenities
      const { data: amenitiesInfo, error: amenitiesError } = await supabase
        .from("amenities")
        .insert({
          ...listing.amenities,
          submission_id: submissionId,
        })
        .select()
        .single();

      if (amenitiesError) throw amenitiesError;

      // Insert into needs_approval
      const { error: approvalError } = await supabase
        .from("needs_approval")
        .insert({
          status: "pending",
          submission_id: submissionId,
          privacy_policy_accepted: listing.privacyPolicy?.accepted || false,
          privacy_policy_date: listing.privacyPolicy?.date || null,
          slug: listing.slug?.current,
          home_info_id: homeInfo.id,
          user_info_id: userInfo.id,
          amenities_id: amenitiesInfo.id,
        });

      if (approvalError) throw approvalError;

      // Delete from Sanity only after all Supabase operations succeed
      await sanityClient.delete(listing._id);

      return NextResponse.json({ success: true });
    } catch (error) {
      // If any error occurs, we'll catch it here and return it
      throw error;
    }
  } catch (error: any) {
    console.error("Error migrating listing:", error);
    return NextResponse.json(
      { error: error.message || "Failed to migrate listing" },
      { status: 500 }
    );
  }
} 