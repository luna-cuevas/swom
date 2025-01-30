import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(request: Request) {
  try {
    const { emails } = await request.json();

    // Get all listings with the provided emails
    const { data: existingListings, error } = await supabase
      .from("listings")
      .select("email")
      .in("email", emails);

    if (error) {
      console.error("Error checking existing listings:", error);
      return NextResponse.json(
        { error: "Error checking existing listings" },
        { status: 500 }
      );
    }

    // Create a Set of emails that already exist in Supabase
    const existingEmails = new Set(existingListings?.map(listing => listing.email) || []);

    return NextResponse.json({ existingEmails: Array.from(existingEmails) });
  } catch (error: any) {
    console.error("Error in checkExistingListings:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
} 