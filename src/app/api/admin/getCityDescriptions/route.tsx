import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    // Get all city descriptions
    const { data: descriptions, error } = await supabase
      .from("city_descriptions")
      .select("*")
      .order("city");

    if (error) {
      return new NextResponse(error.message, { status: 500 });
    }

    return NextResponse.json(descriptions);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
