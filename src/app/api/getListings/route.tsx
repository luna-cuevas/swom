import { NextResponse } from 'next/server';
import { sanityClient } from '../../../../sanity/lib/client';

export async function GET() {
  try {
    const query = `*[_type == "listing"]{
        ...,
      "imageUrl": image.asset->url
    }`;
    const data = await sanityClient.fetch(query);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching data:', error.message);
    return NextResponse.error();
  }
}
