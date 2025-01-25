import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const type = formData.get('type') as string; // 'profile' or 'listing'

    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${type}-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(type === 'profile' ? 'profiles' : 'listings')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(type === 'profile' ? 'profiles' : 'listings')
        .getPublicUrl(filePath);

      return publicUrl;
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      urls: uploadedUrls
    });
  } catch (error: any) {
    console.error("Error uploading images:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload images" },
      { status: 500 }
    );
  }
} 