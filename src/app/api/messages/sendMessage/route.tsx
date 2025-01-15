import { supabaseClient } from '@/utils/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(req: Request, res: Response) {
  try {
    const supabase = supabaseClient();
    const body = await req.json();
    
    console.log('Received message request:', {
      conversation_id: body.conversation_id,
      sender_id: body.sender_id,
      contacted_user: body.contacted_user,
      content_type: typeof body.content
    });

    // Validate required fields
    if (!body.conversation_id || !body.sender_id || !body.contacted_user || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get existing messages
    const { data: existingData, error: existingError } = await supabase
      .from('messages')
      .select('messagesObj')
      .eq('conversation_id', body.conversation_id);

    if (existingError) {
      console.error('Error fetching existing messages:', existingError);
      return NextResponse.json({ error: existingError }, { status: 500 });
    }

    // Check if messagesObj is defined and is an array
    const existingMessagesObj =
      existingData[0] && Array.isArray(existingData[0].messagesObj)
        ? existingData[0].messagesObj
        : [];

    // Append the new message to the existing messages
    const updatedMessages = [
      ...existingMessagesObj,
      {
        sender_id: body.sender_id,
        content: body.content,
        timestamp: new Date(),
      },
    ];

    console.log('Updating messages for conversation:', body.conversation_id);
    
    // Update messages
    const { data, error } = await supabase
      .from('messages')
      .upsert([
        {
          conversation_id: body.conversation_id,
          messagesObj: updatedMessages,
        },
      ])
      .eq('conversation_id', body.conversation_id)
      .select('*');

    if (error) {
      console.error('Error updating messages:', error);
      return NextResponse.json({ error }, { status: 500 });
    }
      
    // Insert into read_receipts table
    const { data: readReceiptData, error: readReceiptError } = await supabase
      .from('read_receipts')
      .insert([
        {
          conversation_id: body.conversation_id,
          user_id: body.contacted_user,
        },
      ])
      .select('*');

    if (readReceiptError) {
      console.error('Error creating read receipt:', readReceiptError);
      // Don't return here, as the message was still sent successfully
    }

    console.log('Message sent successfully:', {
      message_data: data,
      read_receipt: readReceiptData
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in sendMessage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
