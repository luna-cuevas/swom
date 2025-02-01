import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { logAdminAction } from "@/lib/logging";

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get admin session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await request.json();
    const now = new Date().toISOString();

    // Update all matching records in user_info table
    const { data: userInfoData, error: userInfoError } = await supabase
      .from("user_info")
      .update({
        name: user.name,
        profile_image_url: user.profile_image_url,
        dob: user.dob,
        phone: user.phone,
        age: user.age,
        profession: user.profession,
        about_me: user.about_me,
        children: user.children,
        recommended: user.recommended,
        open_to_other_cities: user.open_to_other_cities,
        open_to_other_destinations: user.open_to_other_destinations,
        updated_at: now,
      })
      .eq("email", user.email)
      .select();

    if (userInfoError) {
      console.error("Error updating user info:", userInfoError);
      throw new Error(userInfoError.message);
    }

    // Update appUsers table
    const { data: appUserData, error: appUsersError } = await supabase
      .from("appUsers")
      .update({
        name: user.name,
        email: user.email,
        profession: user.profession,
        age: user.age?.toString(), // Convert to string as per schema
        profileImage: user.profile_image_url, // Map to correct field name
      })
      .eq("email", user.email)
      .select()
      .maybeSingle();

    if (appUsersError) {
      console.error("Error updating appUsers:", appUsersError);
      throw new Error(appUsersError.message);
    }

    // Log the admin action
    await logAdminAction(supabase, session.user.id, "update_user", {
      user_email: user.email,
      updated_fields: {
        name: user.name,
        profession: user.profession,
        age: user.age,
        recommended: user.recommended,
      },
    });

    return NextResponse.json({
      message: "User updated successfully",
      updated_at: now,
      user: {
        ...appUserData,
        ...userInfoData?.[0], // Return the first user_info record in the response
      },
      updatedCount: userInfoData?.length || 0,
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
