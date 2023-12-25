import { supabaseClient } from '@/utils/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(req: Request, res: Response) {
  const supabase = supabaseClient();
  const body = await req.json();
  console.log('server data', body);

  const { data: convoData, error } = await supabase
    .from('conversations')
    .upsert([body])
    .select('*');

  if (convoData) {
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: convoData[0].conversation_id,
        },
      ])
      .select('*');
    if (messagesData) {
      return NextResponse.json(convoData);
    } else {
      return NextResponse.json({ res, error: 'error with messageData' });
    }
  }

  if (error) {
    return NextResponse.json({ res, error: 'errir with convoData' });
  }
}
