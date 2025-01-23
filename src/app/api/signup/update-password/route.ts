import { useSupabaseWithServiceRole } from "@/utils/supabaseClient";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const supabase = useSupabaseWithServiceRole();

    // Update the user's password directly
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Sign in with the new password to get a session
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json({ error: signInError.message }, { status: 400 });
    }

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
    }

    return NextResponse.json({ session: data.session });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
} 