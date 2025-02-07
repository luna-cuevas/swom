import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Get file metadata from the database
    const { data: attachment, error: attachmentError } = await supabase
      .from("message_attachments")
      .select("*")
      .eq("id", fileId)
      .single();

    if (attachmentError) {
      console.error("Error fetching attachment metadata:", attachmentError);
      return NextResponse.json(
        { error: attachmentError.message },
        { status: 500 }
      );
    }

    if (!attachment) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Generate a signed URL that expires in 1 hour
    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from("files")
      .createSignedUrl(attachment.storage_path, 3600);

    if (signedUrlError) {
      console.error("Error generating signed URL:", signedUrlError);
      return NextResponse.json(
        { error: signedUrlError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: signedUrl.signedUrl,
      filename: attachment.filename,
      fileType: attachment.file_type,
    });
  } catch (error: any) {
    console.error("Error handling file download:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
