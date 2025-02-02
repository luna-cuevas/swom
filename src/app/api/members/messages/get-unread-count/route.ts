import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    // Get unread message count
    const { count: unreadCount, error: countError } = await supabase
      .from('message_status')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'unread');

    if (countError) {
      console.error('Error getting unread count:', countError);
      return NextResponse.json(
        { error: "Failed to get unread count" },
        { status: 500 }
      );
    }

    // Get conversations with unread messages
    const { data: unreadMessages, error: messagesError } = await supabase
      .from('message_status')
      .select(`
        id,
        message_id,
        messages_new!inner (
          id,
          conversation_id
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'unread');

    if (messagesError) {
      console.error('Error getting unread messages:', messagesError);
      return NextResponse.json(
        { error: "Failed to get unread messages" },
        { status: 500 }
      );
    }

    // Count unread messages per conversation
    const conversationCounts: Record<string, number> = {};
    unreadMessages?.forEach((msg) => {
      if (msg.messages_new && msg.messages_new.length > 0) {
        const convId = msg.messages_new[0].conversation_id;
        conversationCounts[convId] = (conversationCounts[convId] || 0) + 1;
      }
    });

    console.log('Unread counts:', {
      totalUnread: unreadCount,
      conversationCounts,
      userId,
      unreadMessages
    });

    return NextResponse.json({
      totalUnread: unreadCount,
      conversationCounts
    });
  } catch (error) {
    console.error('Error in get-unread-count route:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 