import { NextResponse } from 'next/server';
import { sanityClient } from '../../../../sanity/lib/client';

export async function GET(req: Request, res: Response) {
  try {
    const query = `*[_type == "highlightedListings"]{
      listings[]->{
        _id,
        userInfo {
          email
        },
        homeInfo {
          "firstImage": listingImages[0]
        }
      }
    }`;
    const data = await sanityClient.fetch(query);

    return NextResponse.json(data[0].listings);
  } catch (error: any) {
    console.error('Error fetching data:', error.message);
    return NextResponse.error();
  }
}
