import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );
    const { email } = await req.json();
    console.log('Fetching conversations for user:', email);

    if (!email) {
      console.error('No email provided');
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }



    // Get all conversations where the user is either the host or the user
    const { data: conversations, error } = await supabase
      .from('conversations_new')
      .select(`
        id,
        created_at,
        updated_at,
        last_message,
        last_message_at,
        host_email,
        user_email,
        listing_id,
        participants:conversation_participants(
          user_id,
          last_read_at,
          user:appUsers(
            id,
            name,
            profileImage,
            email
          )
        )
      `)
      .or(`host_email.eq."${email}",user_email.eq."${email}"`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }

    // Filter out conversations with missing participants
    const validConversations = conversations?.filter(conv =>
      conv.participants &&
      conv.participants.length > 0 &&
      conv.participants.every(p => p.user)
    ) || [];

    console.log('Found conversations:', validConversations.length);
    return NextResponse.json({ conversations: validConversations });
  } catch (error) {
    console.error('Error in get-conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
} 