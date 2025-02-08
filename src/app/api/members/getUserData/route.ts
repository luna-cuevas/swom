import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logAdminAction as logUserAction } from "@/lib/logging";

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Get email and userId from query params
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");

    console.log("Fetching user data for:", { email, userId });

    if (!email || !userId) {
      return NextResponse.json(
        { error: "Email and userId are required" },
        { status: 400 }
      );
    }

    // Fetch user data from both tables
    const [appUserResult, userInfoResult] = await Promise.all([
      supabase.from("appUsers").select("*").eq("email", email).single(),
      supabase.from("user_info").select("*").eq("email", email).order('created_at', { ascending: false }).limit(1),
    ]);

    console.log("Query results:", {
      appUser: { data: appUserResult.data, error: appUserResult.error },
      userInfo: { data: userInfoResult.data, error: userInfoResult.error },
    });

    if (appUserResult.error) {
      console.error("Database query error:", appUserResult.error.message);
      throw new Error(appUserResult.error.message);
    }

    if (!appUserResult.data) {
      console.error("No app user data found for email:", email);
      throw new Error("User not found");
    }

    // Get the most recent user_info record if it exists
    const userInfoData = userInfoResult.data?.[0] || {};

    const userData = {
      ...appUserResult.data,
      ...userInfoData,
    };

    return NextResponse.json({
      user: userData,
    });
  } catch (error: any) {
    console.error("Error in getUserData:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: error.message || "Failed to fetch user data" },
      { status: 500 }
    );
  }
} 