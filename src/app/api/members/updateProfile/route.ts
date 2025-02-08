import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const STORAGE_BUCKET = "profileImages";

async function uploadProfileImage(
  supabase: any,
  file: Buffer,
  userId: string,
  fileName: string
): Promise<string> {
  const fileExt = fileName.split(".").pop();
  const timestamp = Date.now();
  const filePath = `${userId}/${timestamp}_profile.${fileExt}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error: any) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image: " + (error.message || "Unknown error"));
  }
}

export async function PUT(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Parse form data
    const formData = await request.formData();
    const userData = JSON.parse(formData.get("data") as string);
    const imageFile = formData.get("image") as File | null;

    const { email, userId, name, profession, age, phone } = userData;

    if (!email || !userId) {
      return NextResponse.json(
        { error: "Email and userId are required" },
        { status: 400 }
      );
    }

    // Handle image upload if provided
    let profileImageUrl = userData.profileImage;
    if (imageFile) {
      try {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        profileImageUrl = await uploadProfileImage(
          supabase,
          buffer,
          userId,
          imageFile.name
        );
      } catch (error: any) {
        console.error("Error handling profile image:", error);
        throw new Error("Failed to upload profile image");
      }
    }

    // Update user_info table
    const { data: userInfoData, error: userInfoError } = await supabase
      .from("user_info")
      .upsert({
        email,
        name,
        profile_image_url: profileImageUrl,
        phone,
        age,
        profession,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userInfoError) {
      console.error("Error updating user info:", userInfoError);
      throw userInfoError;
    }

    // Update appUsers table
    const { data: appUserData, error: appUsersError } = await supabase
      .from("appUsers")
      .update({
        name,
        profileImage: profileImageUrl,
        profession,
        age: age?.toString(),
      })
      .eq("email", email)
      .select()
      .single();

    if (appUsersError) {
      console.error("Error updating appUsers:", appUsersError);
      throw appUsersError;
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        ...appUserData,
        ...userInfoData,
      },
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
} 