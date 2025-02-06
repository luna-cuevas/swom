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
          conversation_id,
          sender_id,
          content,
          created_at,
          conversations_new:conversation_id (
            id,
            host_email,
            user_email,
            last_message,
            last_message_at,
            listing_id
          )
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'unread');

    console.log("unreadMessages", unreadMessages?.[0]?.messages_new?.[0]?.conversations_new);

    if (messagesError) {
      console.error("Error getting unread messages:", messagesError);
      return NextResponse.json(
        { error: "Failed to get unread messages" },
        { status: 500 }
      );
    }

    // Count unread messages per conversation and store conversation details
    const conversationCounts: Record<string, { count: number, conversation: any }> = {};
    unreadMessages?.forEach((msg) => {
      const message = msg.messages_new?.[0];
      if (message?.conversation_id && message.conversations_new) {
        const conversation = message.conversations_new;
        const convId = message.conversation_id;

        if (!conversationCounts[convId]) {
          conversationCounts[convId] = {
            count: 1,
            conversation
          };
        } else {
          conversationCounts[convId].count += 1;
        }
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