import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const conversationId = formData.get("conversationId") as string;
    const senderId = formData.get("senderId") as string;

    if (!file || !conversationId || !senderId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const fileExt = file.name.split(".").pop();
    const uniqueId = crypto.randomUUID();
    const fileName = `${uniqueId}.${fileExt}`;
    const filePath = `message-attachments/${conversationId}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("files")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("files").getPublicUrl(filePath);

    // Create thumbnail for images and videos if possible
    let thumbnailUrl = undefined;
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const thumbnailPath = `message-attachments/${conversationId}/thumbnails/${fileName}`;
      // Note: You might want to implement actual thumbnail generation here
      // For now, we'll use the same URL
      thumbnailUrl = publicUrl;
    }

    // Store file metadata in the database
    const { data: attachmentData, error: attachmentError } = await supabase
      .from("message_attachments")
      .insert({
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        url: publicUrl,
        thumbnail_url: thumbnailUrl,
        conversation_id: conversationId,
        sender_id: senderId,
        storage_path: filePath,
      })
      .select()
      .single();

    if (attachmentError) {
      console.error("Error storing attachment metadata:", attachmentError);
      return NextResponse.json(
        { error: attachmentError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: attachmentData.id,
      filename: attachmentData.filename,
      fileType: attachmentData.file_type,
      fileSize: attachmentData.file_size,
      url: attachmentData.url,
      thumbnailUrl: attachmentData.thumbnail_url,
    });
  } catch (error: any) {
    console.error("Error handling file upload:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
