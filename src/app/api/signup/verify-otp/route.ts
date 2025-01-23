import { useSupabaseWithServiceRole } from "@/utils/supabaseClient";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();
    const supabase = useSupabaseWithServiceRole();

    const { error, data } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
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
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
} 