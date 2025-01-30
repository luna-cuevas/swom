import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    const { email } = await request.json();
    console.log("email", email);



    // Get user info from user_info table
    const { data: userInfo, error } = await supabase
      .from("user_info")
      .select("*")
      .eq("email", email)
      .limit(1)
      .single();



    if (error) {
      console.error("Error fetching user info:", error);
      return NextResponse.json(
        { error: "Failed to fetch user info" },
        { status: 500 }
      );
    }

    return NextResponse.json(userInfo);
  } catch (error) {
    console.error("Error in getUserInfo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 