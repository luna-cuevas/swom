import { supabaseClient } from '@/utils/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(req: Request, res: Response) {
  const supabase = supabaseClient();
  const body = await req.json();
  const id = body.userId;

  if (id) {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', id)
      .limit(50);
    if (error) {
      throw error;
    }
    return NextResponse.json(data);
  } else {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .limit(50);
    if (error) {
      throw error;
    }
    return NextResponse.json(data);
  }
}
