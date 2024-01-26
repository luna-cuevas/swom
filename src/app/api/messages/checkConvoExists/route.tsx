import { supabaseClient } from '@/utils/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(req: Request, res: Response) {
  const supabase = supabaseClient();

  try {
    const body = await req.json();
    const { data: convoData, error } = await supabase
      .from('conversations')
      .select('*')
      .contains('members', {
        1: { id: body['1'].id },
        2: { id: body['2'].id },
      });

    if (error) {
      throw error;
    }

    // Return the response as JSON
    return NextResponse.json(convoData);
  } catch (error: any) {
    console.error('Error:', error.message);
    return NextResponse.json({ res, error: 'Internal server error' });
  }
}
