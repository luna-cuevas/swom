import { supabaseClient } from '@/utils/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(req: Request, res: Response) {
  const supabase = supabaseClient();
  const body = await req.json();

  const { data: existingData, error: existingError } = await supabase
    .from('messages')
    .select('messagesObj')
    .eq('conversation_id', body.selectedConversation);

  if (existingError) {
    return NextResponse.json({ res, error: existingError });
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

  const { data, error } = await supabase
    .from('messages')
    .upsert([
      {
        conversation_id: body.conversation_id,
        messagesObj: updatedMessages,
      },
    ])
    .eq('conversation_id', body.selectedConversation)
    .select('*');

  if (data) {
    console.log('server - messages data', data);
    return NextResponse.json(data);
  } else {
    throw error;
  }
}
