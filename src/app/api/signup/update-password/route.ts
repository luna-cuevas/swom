import { getSupabaseAdmin } from "@/utils/supabaseClient";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log('[update-password] Starting password update for email:', email);

    const supabase = getSupabaseAdmin();

    // Get the user's ID first
    const { data: userData, error: userError } = await supabase
      .from('appUsers')
      .select('id')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('[update-password] Failed to get user:', userError);
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }

    if (!userData) {
      console.error('[update-password] User not found');
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update the user's password
    console.log('[update-password] Attempting to update password for user:', userData.id);
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userData.id,
      { password }
    );

    if (updateError) {
      console.error('[update-password] Password update failed:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    console.log('[update-password] Password update successful');

    // Sign in with the new password to get a fresh session
    console.log('[update-password] Attempting to sign in with new password');
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('[update-password] Final sign in failed:', signInError);
      return NextResponse.json({ error: signInError.message }, { status: 400 });
    }

    console.log('[update-password] Final sign in successful, got session:', data.session?.user?.id);

    // Set the session cookie
    const cookieStore = cookies();
    if (data?.session) {
      cookieStore.set('sb-access-token', data.session.access_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      cookieStore.set('sb-refresh-token', data.session.refresh_token!, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      console.log('[update-password] Set session cookies');
    }

    return NextResponse.json({ session: data.session });
  } catch (error) {
    console.error('[update-password] Unexpected error:', error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
} 