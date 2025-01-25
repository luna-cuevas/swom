import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  profile_image_url?: string;
}

interface HomeInfo {
  title: string;
  listing_images: string[];
  price_per_night: number;
}

interface ListingData {
  id: string;
  user_info: UserInfo;
  home_info: HomeInfo;
}

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    const { listingId } = await req.json();

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Get host info from listings table using host_email
    const { data: listingData, error: listingError } = await supabase
      .from('listings')
      .select(`
        id,
        user_info:user_info_id (
          id,
          name,
          email,
          profile_image_url
        ),
        home_info:home_info_id (
          title,
          listing_images
        )
      `)
      .eq('id', listingId)
      .single() as { data: ListingData | null; error: any };

    if (listingError) {
      console.error('Error fetching listing:', listingError);
      return NextResponse.json(
        { error: 'Failed to fetch listing information' },
        { status: 500 }
      );
    }

    // If we found the listing, return both host and listing info
    if (listingData) {
      return NextResponse.json({
        host: {
          id: listingData.user_info.id,
          name: listingData.user_info.name,
          email: listingData.user_info.email,
          profileImage: listingData.user_info.profile_image_url
        },
        listing: {
          id: listingData.id,
          title: listingData.home_info.title || 'Untitled Listing',
          price_per_night: 0,
          images: listingData.home_info.listing_images || []
        }
      });
    }

    return NextResponse.json(
      { error: 'Listing not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error in get-conversation-info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation information' },
      { status: 500 }
    );
  }
} 