import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/logging";

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const { city, description, adminId } = await request.json();

    if (!city || !description || !adminId) {
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

    // Log the city description creation
    await logAdminAction(supabase, adminId, "create_city_description", {
      city,
      description_length: description.length,
      city_description_id: data.id,
    });

    return NextResponse.json(data);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
