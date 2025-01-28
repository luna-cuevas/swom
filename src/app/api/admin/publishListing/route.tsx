import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const { listingId, status } = await req.json();

    if (!listingId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update the listing status
    const { data, error } = await supabase
      .from("listings")
      .update({ status: status === "publish" ? "published" : "archived" })
      .eq("id", listingId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating listing publish status:", error);
    return NextResponse.json(
      { error: "Failed to update listing publish status" },
      { status: 500 }
    );
  }
}
