import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { logMemberAction } from '@/lib/logging';

interface FileAttachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
}

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    const { conversation_id, content, sender_id, listing_id, user_email, host_email, attachments, type } = await req.json();

    if (!conversation_id || !sender_id || (!content && (!attachments || attachments.length === 0))) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First get both participants from the conversation
    const { data: participants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversation_id);

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
      return NextResponse.json(
        { error: 'Failed to fetch participants' },
        { status: 500 }
      );
    }

    // Get partner ID
    const partner_id = participants?.find(p => p.user_id !== sender_id)?.user_id;

    if (!sender_id || !partner_id) {
      console.error('Could not identify both participants');
      return NextResponse.json(
        { error: 'Could not identify conversation participants' },
        { status: 500 }
      );
    }

    // First get the conversation and sender info
    const [{ data: conversation, error: convError }, { data: sender, error: senderError }] = await Promise.all([
      supabase
        .from('conversations_new')
        .select('host_email, user_email, listing_id')
        .eq('id', conversation_id)
        .single(),
      supabase
        .from('appUsers')
        .select('email')
        .eq('id', sender_id)
        .single()
    ]);

    if (convError || senderError) {
      console.error('Error fetching data:', { convError, senderError });
      return NextResponse.json(
        { error: 'Failed to fetch required data' },
        { status: 500 }
      );
    }

    // Create the message
    const { data: message, error: messageError } = await supabase
      .from('messages_new')
      .insert({
        conversation_id,
        content: content || '',  // Use empty string if no content (attachment only)
        sender_id,
        type,
      })
      .select(`
        *,
        sender:appUsers(
          id,
          name,
          profileImage,
          email
        )
      `)
      .single();

    if (messageError) {
      console.error('Error creating message:', messageError);
      return NextResponse.json(
        { error: 'Failed to create message' },
        { status: 500 }
      );
    }

    // If there are attachments, link them to the message
    if (attachments && attachments.length > 0) {
      console.log('Attempting to link attachments:', {
        messageId: message.id,
        attachmentIds: attachments.map((att: FileAttachment) => att.id)
      });

      const { data: updateData, error: attachmentError } = await supabase
        .from('message_attachments')
        .update({ message_id: message.id })
        .in('id', attachments.map((att: FileAttachment) => att.id))
        .select();

      if (attachmentError) {
        console.error('Error linking attachments:', {
          error: attachmentError,
          details: attachmentError.details,
          message: attachmentError.message,
          hint: attachmentError.hint
        });
        // Don't fail the whole request, but log the error
      } else {
        console.log('Successfully linked attachments:', updateData);
      }
    }

    // Update conversation with the message and emails
    interface UpdateData {
      last_message: string;
      last_message_at: string;
      host_email?: string;
      user_email?: string;
      listing_id?: string;
    }

    const updateData: UpdateData = {
      last_message: content || (attachments?.length ? 'Sent an attachment' : ''),
      last_message_at: new Date().toISOString(),
    };

    // Set emails if they're not already set
    if (conversation && !conversation.host_email && host_email) {
      updateData.host_email = host_email;
    }
    if (conversation && !conversation.user_email && user_email) {
      updateData.user_email = user_email;
    }

    // Update listing_id if provided and not already set
    if (listing_id && conversation && !conversation.listing_id) {
      updateData.listing_id = listing_id;
    }

    // Update the conversation
    const { error: updateError } = await supabase
      .from('conversations_new')
      .update(updateData)
      .eq('id', conversation_id);

    if (updateError) {
      console.error('Error updating conversation:', updateError);
      // Don't return error here as the message was already created
    }

    // Send broadcast message about new message status
    const channel = supabase.channel("message_status_room");

    await channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        // Send notification to recipient
        await channel.send({
          type: "broadcast",
          event: "message_status",
          payload: {
            user_id: partner_id,
            sender_id: sender_id,
            action: "new_message",
            conversation_id
          }
        });

        // Send notification to sender
        await channel.send({
          type: "broadcast",
          event: "message_status",
          payload: {
            user_id: sender_id,
            sender_id: sender_id,
            action: "new_message",
            conversation_id
          }
        });

        // Clean up the channel after sending
        await supabase.removeChannel(channel);
      }
    });

    // Get the message with its attachments
    const { data: messageWithAttachments, error: fetchError } = await supabase
      .from('messages_new')
      .select(`
        id,
        content,
        created_at,
        type,
        sender:appUsers(
          id,
          name,
          profileImage,
          email
        ),
        attachments:message_attachments(*)
      `)
      .eq('id', message.id)
      .single();

    if (fetchError) {
      console.error('Error fetching message with attachments:', fetchError);
    }

    // Format the message to match the frontend's expected structure
    const formattedMessage = {
      id: message.id,
      content: message.content,
      created_at: message.created_at,
      type: message.type,
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        avatar_url: message.sender.profileImage
      },
      attachments: messageWithAttachments?.attachments || []
    };

    // Log the message sending
    await logMemberAction(supabase, sender_id, 'send_message', {
      conversation_id,
      message_id: message.id,
      content: content || 'Sent an attachment',
      has_attachments: attachments?.length > 0,
      recipient_id: partner_id
    });

    // Insert into read_receipts table
    const { data: readReceiptData, error: readReceiptError } = await supabase
      .from("read_receipts")
      .insert([
        {
          conversation_id: conversation_id,
          user_id: partner_id,
        },
      ])
      .select("*");

    if (readReceiptError) {
      console.error('Read Receipt Error:', readReceiptError);
      console.error('Failed for conversation:', conversation_id, 'partner:', partner_id);
    } else {
      console.log('Read Receipt Created Successfully:', {
        conversation_id,
        partner_id,
        receipt: readReceiptData
      });
    }

    return NextResponse.json({ message: formattedMessage });
  } catch (error) {
    console.error('Error in send-message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 