import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const formData = await request.formData();
    const files = formData.getAll("files");
    const user_id = formData.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const buffer = await file.arrayBuffer();
      const fileName = `${user_id}-${Date.now()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from("listing-images")
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("listing-images").getPublicUrl(fileName);

      urls.push(publicUrl);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Error uploading images:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
} 