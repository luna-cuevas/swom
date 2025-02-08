import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PUT(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { newPassword, userId, email } = await request.json();

    if (!newPassword || !userId || !email) {
      return NextResponse.json(
        { error: "New password, userId, and email are required" },
        { status: 400 }
      );
    }

    // Update password
    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) {
      console.error("Error updating password:", error);
      throw error;
    }

    return NextResponse.json({
      message: "Password updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update password" },
      { status: 500 }
    );
  }
} 