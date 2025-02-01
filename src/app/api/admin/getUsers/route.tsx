import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch users from both tables and combine the data
    const { data: appUsers, error: appUsersError } = await supabase
      .from("appUsers")
      .select("*");

    const { data: userInfo, error: userInfoError } = await supabase
      .from("user_info")
      .select("*");

    if (appUsersError) {
      throw new Error(appUsersError.message);
    }

    // Combine data from both tables based on email, including users without user_info
    const combinedUsers = appUsers.map((appUser) => {
      const userInfoData = userInfo?.find(
        (info) => info?.email === appUser.email
      );
      return {
        ...appUser,
        ...userInfoData,
        has_listing: !!userInfoData, // Flag to indicate if user has listing data
        subscription_status: appUser.subscribed ? "Subscribed" : "Unsubscribed",
      };
    });

    return NextResponse.json(combinedUsers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
