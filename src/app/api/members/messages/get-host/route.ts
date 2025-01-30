import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

interface HomeInfo {
  title: string;
  listing_images: string[];
  price_per_night: number;
}

interface ListingData {
  id: string;
  user_info: {
    id: string;
    name: string;
    email: string;
  };
  home_info: {
    title: string;
    listing_images: string[];
    price_per_night: number;
  };
}

export async function GET(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    const url = new URL(req.url);
    const listingId = url.searchParams.get('listingId');
    const email = url.searchParams.get('email');
    const conversationId = url.searchParams.get('conversationId');

    console.log("listingId", listingId);
    console.log("email", decodeURIComponent(email || ""));
    console.log("conversationId", conversationId);

    // If no conversation ID but we have email/listingId (new conversation case)
    if (listingId && email) {
      // First get the listing info
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select(`
          id,
          user_info:user_info_id (
            id,
            name,
            email
          ),
          home_info:home_info_id (
            title,
            listing_images
          )
        `)
        .eq('id', listingId)
        .single() as { data: ListingData | null; error: any };

      if (listingError || !listingData) {
        console.error('Error fetching listing:', listingError);
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        );
      }

      console.log("email", decodeURIComponent(email));

      // Get host info using email
      const { data: hostData, error: userError } = await supabase
        .from('appUsers')
        .select('id, name, profileImage, email')
        .eq('email', decodeURIComponent(email))
        .maybeSingle();

      if (userError || !hostData) {
        console.error('Error fetching host:', userError);
        return NextResponse.json(
          { error: 'Host not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        host: {
          id: hostData.id,
          name: hostData.name,
          profileImage: hostData.profileImage,
          email: hostData.email
        },
        listing: {
          id: listingData.id,
          title: listingData.home_info?.title || 'Untitled Listing',
          price_per_night: listingData.home_info?.price_per_night || 0,
          images: listingData.home_info?.listing_images || []
        }
      });
    }

    // If we have a conversation ID, get the host info from there
    if (conversationId) {
      const { data: conversation, error: convError } = await supabase
        .from('conversations_new')
        .select(`
          id,
          host_email,
          listing_id
        `)
        .eq('id', conversationId)
        .single();

      if (convError || !conversation) {
        console.error('Error fetching conversation:', convError);
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      // Get host info using the host_email
      const { data: hostData, error: userError } = await supabase
        .from('appUsers')
        .select('id, name, profileImage, email')
        .eq('email', conversation.host_email)
        .single();

      if (userError || !hostData) {
        console.error('Error fetching host:', userError);
        return NextResponse.json(
          { error: 'Host not found' },
          { status: 404 }
        );
      }

      // Get listing info if we have a listing_id
      if (conversation.listing_id) {
        const { data: listingData, error: listingError } = await supabase
          .from('listings')
          .select(`
            id,
            user_info:user_info_id (
              id,
              name,
              email
            ),
            home_info:home_info_id (
              title,
              listing_images,
            )
          `)
          .eq('id', conversation.listing_id)
          .single() as { data: ListingData | null; error: any };

        if (!listingError && listingData) {
          return NextResponse.json({
            host: {
              id: hostData.id,
              name: hostData.name,
              profileImage: hostData.profileImage,
              email: hostData.email
            },
            listing: {
              id: listingData.id,
              title: listingData.home_info?.title || 'Untitled Listing',
              images: listingData.home_info?.listing_images || []
            }
          });
        }
      }

      // Return just host data if no listing found
      return NextResponse.json({
        host: {
          id: hostData.id,
          name: hostData.name,
          profileImage: hostData.profileImage,
          email: hostData.email
        }
      });
    }

    // If no conversation ID but we have email/hostId (new conversation case)
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get host info using email
    const { data: hostData, error: userError } = await supabase
      .from('appUsers')
      .select('id, name, profileImage, email')
      .eq('email', email)
      .single();

    if (userError || !hostData) {
      console.error('Error fetching host:', userError);
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      );
    }

    // Get their most recent active listing
    const { data: listingData, error: listingError } = await supabase
      .from('listings')
      .select(`
        id,
        user_info:user_info_id (
          id,
          name,
          email
        ),
        home_info:home_info_id (
          title,
          listing_images,
          price_per_night
        )
      `)
      .eq('email', email)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single() as { data: ListingData | null; error: any };

    return NextResponse.json({
      host: {
        id: hostData.id,
        name: hostData.name,
        profileImage: hostData.profileImage
      },
      listing: listingData ? {
        id: listingData.id,
        title: listingData.home_info?.title || 'Untitled Listing',
        price_per_night: listingData.home_info?.price_per_night || 0,
        images: listingData.home_info?.listing_images || []
      } : null
    });
  } catch (error) {
    console.error('Error in get-host:', error);
    return NextResponse.json(
      { error: 'Failed to fetch host information' },
      { status: 500 }
    );
  }
} 