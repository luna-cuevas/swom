import { supabaseClient } from '@/utils/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(req: Request, res: Response) {
  const supabase = supabaseClient();
  const stateId = await req.json();

  const { data: position1Data, error } = await supabase
    .from('conversations')
    .select('*')
    .contains('members', {
      1: { id: stateId.id },
    });

  const { data: position2Data, error: error2 } = await supabase
    .from('conversations')
    .select('*')
    .contains('members', {
      2: { id: stateId.id },
    });

  if (error || error2) {
    throw error;
  }
  return NextResponse.json([...position1Data, ...position2Data]);
}
