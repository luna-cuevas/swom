import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');
    const userId = url.searchParams.get('userId');
    console.log('Fetching messages for conversation:', conversationId, 'user:', userId);

    if (!conversationId || !userId) {
      console.error('Missing required parameters:', { conversationId, userId });
      return NextResponse.json(
        { error: 'Conversation ID and User ID are required' },
        { status: 400 }
      );
    }

    const { data: messages, error } = await supabase
      .from('messages_new')
      .select(`
        *,
        sender:appUsers(
          id,
          name,
          profileImage
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    console.log('Found messages:', messages?.length || 0);

    // Update last_read_at for the user
    const { error: updateError } = await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating last_read_at:', updateError);
    } else {
      console.log('Updated last_read_at for user:', userId);
    }

    // Transform the messages to match the expected format
    const formattedMessages = messages?.map(message => ({
      id: message.id,
      content: message.content,
      created_at: message.created_at,
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        avatar_url: message.sender.profileImage
      }
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error in get-messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
} 