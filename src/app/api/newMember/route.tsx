import { supabaseClient } from '../../../utils/supabaseClient';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const data = await req.json();
  console.log('data', data);
  const { email } = data;

  const supabase = supabaseClient();

  // Invite the user by email
  const { data: res, error } = await supabase.auth.admin.inviteUserByEmail(
    email,
    {
      data: { role: 'planner' },
      redirectTo: `http://localhost:3000/auth/callback?next=/update-password`,
    }
  );
  return NextResponse.json({ res, error });
}
