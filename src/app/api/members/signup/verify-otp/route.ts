import { getSupabaseAdmin } from "@/utils/supabaseClient";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();
    console.log('[verify-otp] Starting OTP verification for email:', email);

    const supabase = getSupabaseAdmin();

    // First verify the OTP
    const { error: verifyError, data: verifyData } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (verifyError) {
      console.error('[verify-otp] OTP verification failed:', verifyError);
      return NextResponse.json({ error: verifyError.message }, { status: 400 });
    }

    console.log('[verify-otp] OTP verification successful:', verifyData);

    // Get the user's session from the OTP verification
    if (!verifyData.session) {
      console.error('[verify-otp] No session received from OTP verification');
      return NextResponse.json({ error: "No session received" }, { status: 400 });
    }

    console.log('[verify-otp] Got session from OTP verification:', verifyData.session.user?.id);

    // Set the session cookie
    const cookieStore = cookies();
    cookieStore.set('sb-access-token', verifyData.session.access_token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    cookieStore.set('sb-refresh-token', verifyData.session.refresh_token!, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    console.log('[verify-otp] Set session cookies');

    return NextResponse.json({
      session: verifyData.session
    });
  } catch (error) {
    console.error('[verify-otp] Unexpected error:', error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
} 