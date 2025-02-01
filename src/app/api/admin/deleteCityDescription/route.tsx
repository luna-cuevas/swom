import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/logging";

export async function DELETE(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const adminId = searchParams.get("adminId");

    if (!id || !adminId) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    // Get city description details for logging before deletion
    const { data: cityDescription, error: fetchError } = await supabase
      .from("city_descriptions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching city description:", fetchError);
      throw fetchError;
    }

    // Delete city description
    const { error } = await supabase
      .from("city_descriptions")
      .delete()
      .eq("id", id);

    if (error) {
      return new NextResponse(error.message, { status: 500 });
    }

    // Log the city description deletion
    await logAdminAction(supabase, adminId, "delete_city_description", {
      city_description_id: id,
      city: cityDescription.city,
      description_length: cityDescription.description.length,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
