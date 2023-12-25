import { supabaseClient } from '@/utils/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(req: Request, res: Response) {
  const supabase = supabaseClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', body.id);

  if (error) {
    throw error;
  }
  console.log('messages', data);
  return NextResponse.json(data);
}
