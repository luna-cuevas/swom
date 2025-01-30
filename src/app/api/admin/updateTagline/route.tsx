import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const { listingId, tagline } = await req.json();

    if (!listingId || tagline === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("listings")
      .update({ highlight_tag: tagline })
      .eq("id", listingId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating tagline:", error);
    return NextResponse.json(
      { error: "Failed to update tagline" },
      { status: 500 }
    );
  }
}
