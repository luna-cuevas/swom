import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = 'edge';

interface MessageStatus {
  id: string;
  message_id: string;
  user_id: string;
  status: 'unread' | 'read' | 'delivered';
  read_at: string | null;
  email_sent_at: string | null;
  created_at: string;
  updated_at: string;
  messages: {
    content: string;
    conversation_id: string;
    sender: {
      name: string;
      email: string;
    };
  };
  user: {
    name: string;
    email: string;
  };
}

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    // Get unread messages that are over 24 hours old and haven't had an email sent
    const { data: unreadMessages, error: unreadError } = await supabase
      .from('message_status')
      .select(`
        *,
        messages:messages_new (
          content,
          conversation_id,
          sender:profiles!messages_new_sender_id_fkey (
            name,
            email
          )
        ),
        user:profiles!message_status_user_id_fkey (
          name,
          email
        )
      `)
      .eq('status', 'unread')
      .is('email_sent_at', null)
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (unreadError) {
      console.error('Error fetching unread messages:', unreadError);
      return NextResponse.json(
        { error: "Failed to fetch unread messages" },
        { status: 500 }
      );
    }

    if (!unreadMessages || unreadMessages.length === 0) {
      return NextResponse.json({ message: "No unread messages to process" });
    }

    // Group messages by user to send one email per user
    const messagesByUser = unreadMessages.reduce<Record<string, MessageStatus[]>>((acc, message) => {
      if (!acc[message.user_id]) {
        acc[message.user_id] = [];
      }
      acc[message.user_id].push(message);
      return acc;
    }, {});

    // Send emails for each user
    const emailPromises = Object.entries(messagesByUser).map(async ([userId, messages]) => {
      const user = messages[0].user;
      if (!user?.email) return;

      // Prepare email parameters
      const params = {
        userName: user.name,
        messageCount: messages.length.toString(),
        messagePreview: messages.map(msg => ({
          sender: msg.messages.sender.name,
          preview: msg.messages.content.substring(0, 100) + (msg.messages.content.length > 100 ? '...' : '')
        })).slice(0, 3), // Preview first 3 messages
        messagesUrl: `${process.env.BASE_URL}/messages`
      };

      // Send email using Brevo template
      const emailResponse = await fetch(`${process.env.BASE_URL}/api/admin/sendBrevoTemplate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          templateId: 5,
          params
        })
      });

      if (!emailResponse.ok) {
        throw new Error(`Failed to send email to ${user.email}`);
      }

      // Update message_status records to mark email as sent
      const { error: updateError } = await supabase
        .from('message_status')
        .update({ email_sent_at: new Date().toISOString() })
        .in('id', messages.map(m => m.id));

      if (updateError) {
        console.error('Error updating message status:', updateError);
      }
    });

    await Promise.all(emailPromises);

    return NextResponse.json({
      success: true,
      message: `Processed ${unreadMessages.length} unread messages`
    });
  } catch (error) {
    console.error('Error in sendUnreadMessagesEmail:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 