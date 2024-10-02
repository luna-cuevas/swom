import { NextResponse } from "next/server";
import { supabaseClient } from "@/utils/supabaseClient";
import crypto from "crypto";

export async function POST(request: Request) {
  const { consentId, acceptType, acceptedCategories, rejectedCategories } =
    await request.json();
  const supabase = supabaseClient();

  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "";

  // Hash the IP address
  const hashIp = (ip: string) => {
    return crypto.createHash("sha256").update(ip).digest("hex");
  };

  const hashedIp = hashIp(ip);

  try {
    // Step 1: Check if the hashed IP address is already in the table
    const { data: existingRecord, error: searchError } = await supabase
      .from("cookie_consent")
      .select("*")
      .eq("ip_address", hashedIp)
      .single();

    if (searchError && searchError.code !== "PGRST116") {
      return NextResponse.json(
        { error: `Error searching for consent: ${searchError.message}` },
        { status: 500 }
      );
    }

    if (existingRecord) {
      // Step 2: If hashed IP exists, update the existing record
      const { data, error: updateError } = await supabase
        .from("cookie_consent")
        .update({
          consent_id: consentId,
          accept_type: acceptType,
          accepted_categories: acceptedCategories,
          rejected_categories: rejectedCategories,
        })
        .eq("ip_address", hashedIp)
        .select("*");

      if (updateError) {
        return NextResponse.json(
          { error: `Cannot update consent: ${updateError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({ data, message: "Consent updated" });
    } else {
      // Step 3: If no hashed IP exists, insert a new record
      const { data, error: insertError } = await supabase
        .from("cookie_consent")
        .insert({
          ip_address: hashedIp,
          consent_id: consentId,
          accept_type: acceptType,
          accepted_categories: acceptedCategories,
          rejected_categories: rejectedCategories,
        })
        .select("*");

      if (insertError) {
        return NextResponse.json(
          { error: `Cannot set consent: ${insertError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({ data, message: "Consent set" });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: `Error with connection: ${error.message}` },
      { status: 500 }
    );
  }
}
