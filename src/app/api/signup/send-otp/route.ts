import { getSupabaseAdmin } from "@/utils/supabaseClient";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
} 