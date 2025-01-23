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

    // Start a transaction by getting the listing data first
    const { data: listing, error: fetchError } = await supabase
      .from("needs_approval")
      .select(
        `
        *,
        home_info:home_info_id(title, city),
        user_info:user_info_id(
          name, 
          email, 
          phone, 
          dob,
          profession,
          age,
          profile_image_url
        )
      `
      )
      .eq("id", listingId)
      .single();

    if (fetchError) throw fetchError;
    if (!listing) throw new Error("Listing not found");

    if (status === "approved") {
      // Create user in auth system
      const { data: userData, error: userError } =
        await supabase.auth.admin.createUser({
          email: listing.user_info.email,
          password: crypto.randomUUID(), // Random password that will be reset
          user_metadata: {
            name: listing.user_info.name,
            dob: listing.user_info.dob || "",
            phone: listing.user_info.phone,
            role: "member",
          },
          email_confirm: true,
        });

      if (userError) throw userError;

      // Insert into listings table with the new user_id
      const { error: insertError } = await supabase.from("listings").insert({
        id: listing.id,
        status: "approved",
        user_id: userData.user.id,
        user_info_id: listing.user_info_id,
        home_info_id: listing.home_info_id,
        amenities_id: listing.amenities_id,
        highlight_tag: null,
        slug: listing.slug,
        order_rank: null,
        privacy_policy_accepted: listing.privacy_policy_accepted,
        privacy_policy_date: listing.privacy_policy_date,
        created_at: listing.created_at,
        is_highlighted: listing.is_highlighted,
      });

      if (insertError) throw insertError;

      // Create entry in appUsers table
      const { error: appUserError } = await supabase.from("appUsers").insert({
        id: userData.user.id,
        name: listing.user_info.name,
        email: listing.user_info.email,
        role: "member",
        profession: listing.user_info.profession || "",
        age: listing.user_info.age || "",
        profileImage: listing.user_info.profile_image_url || "",
        favorites: [],
        privacyPolicy: listing.privacy_policy_accepted ? "accepted" : "",
        privacyPolicyDate: listing.privacy_policy_date || "",
        created_at: new Date().toISOString(),
      });

      if (appUserError) throw appUserError;

      // Send password reset email using Brevo template 3
      try {
        const resetUrl =
          process.env.NODE_ENV === "development"
            ? `http://localhost:3000/sign-up?email=${listing.user_info.email}`
            : `https://swom.travel/sign-up?email=${listing.user_info.email}`;

        const emailResponse = await fetch(
          `${process.env.BASE_URL}/api/admin/sendBrevoTemplate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: listing.user_info.email,
              templateId: 3,
              params: {
                name: listing.user_info.name,
                url: resetUrl,
              },
            }),
          }
        );

        if (!emailResponse.ok) {
          console.error(
            "Failed to send password reset email:",
            await emailResponse.json()
          );
        }
      } catch (emailError) {
        console.error("Error sending password reset email:", emailError);
      }

      // Delete from needs_approval table
      const { error: deleteError } = await supabase
        .from("needs_approval")
        .delete()
        .eq("id", listingId);

      if (deleteError) throw deleteError;

      // Send approval email
      try {
        const emailResponse = await fetch(
          `${process.env.BASE_URL}/api/admin/sendBrevoTemplate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: listing.user_info.email,
              templateId: 1,
              params: {
                name: listing.user_info.name,
              },
            }),
          }
        );

        if (!emailResponse.ok) {
          console.error(
            "Failed to send approval email:",
            await emailResponse.json()
          );
        }
      } catch (emailError) {
        console.error("Error sending approval email:", emailError);
      }
    } else {
      // Update the status for rejected listings
      const { error: updateError } = await supabase
        .from("needs_approval")
        .update({ status })
        .eq("id", listingId);

      if (updateError) throw updateError;

      // Send rejection email (Brevo template 4)
      try {
        const emailResponse = await fetch("/api/admin/sendBrevoTemplate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: listing.user_info.email,
            templateId: 4,
            params: {
              name: listing.user_info.name,
            },
          }),
        });

        if (!emailResponse.ok) {
          console.error(
            "Failed to send rejection email:",
            await emailResponse.json()
          );
        }
      } catch (emailError) {
        console.error("Error sending rejection email:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating listing status:", error);
    return NextResponse.json(
      { error: "Failed to update listing status" },
      { status: 500 }
    );
  }
}
