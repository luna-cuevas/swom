import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const body = await request.json();
    const { city, description } = body;

    if (!city || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create new city description
    const { data, error } = await supabase
      .from("city_descriptions")
      .insert([{ city, description }])
      .select()
      .single();

    if (error) {
      return new NextResponse(error.message, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
