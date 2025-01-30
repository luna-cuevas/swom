import { createClient } from '@sanity/client';
import { NextResponse } from 'next/server';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2023-05-03',
  useCdn: false,
});

export async function GET() {
  try {
    const query = `*[_type == "listing"] {
      _id,
      orderRank,
      slug,
      highlightTag,
      userInfo {
        name,
        profileImage,
        dob,
        email,
        phone,
        age,
        profession,
        about_me,
        children,
        recommended,
        openToOtherCities,
        openToOtherDestinations
      },
      homeInfo {
        title,
        address,
        description,
        listingImages,
        property,
        howManySleep,
        locatedIn,
        city,
        mainOrSecond,
        bathrooms,
        area
      },
      amenities,
      privacyPolicy
    }`;

    const listings = await client.fetch(query);
    return NextResponse.json(listings);
  } catch (error) {
    console.error('Error fetching Sanity listings:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
} 