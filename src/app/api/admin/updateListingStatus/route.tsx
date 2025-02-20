import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/logging";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  try {
    const clonedReq = req.clone(); 
    const rawBody = await clonedReq.text();
    console.info("📩 Raw request body received:", rawBody);
    console.info("📏 Actual received body size:", Buffer.byteLength(rawBody, "utf-8"));
  
    const { listingId, status, adminId } = await req.json();

    if (!listingId || !status || !adminId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    console.info("✅ Parsed request body:", { listingId, status, adminId });


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
    console.info("🏡 Listing data fetched from Supabase:", JSON.stringify(listing, null, 2));

    if (status === "approved") {
      // First check if user exists in auth system
      const { data: users, error: listUsersError } =
        await supabase.auth.admin.listUsers();
      const existingAuthUser = users?.users.find(
        (user) => user.email === listing.user_info.email
      );

      let userId;

      if (existingAuthUser) {
        // User exists in auth system
        userId = existingAuthUser.id;

        // Update user metadata if needed
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            name: listing.user_info.name,
            dob: listing.user_info.dob || "",
            phone: listing.user_info.phone,
            role: "member",
          },
        });
      } else {
        // Create new user in auth system
        const { data: userData, error: userError } =
          await supabase.auth.admin.createUser({
            email: listing.user_info.email,
            password: crypto.randomUUID(),
            user_metadata: {
              name: listing.user_info.name,
              dob: listing.user_info.dob || "",
              phone: listing.user_info.phone,
              role: "member",
            },
            email_confirm: true,
          });
          
          
          if (userError) {
            console.error("Error creating user:", userError);
            throw userError;
          }
          
          userId = userData.user.id;
        }
        console.info("👤 User ID determined:", userId);

      // Check if user exists in appUsers table
      const { data: existingAppUser } = await supabase
        .from("appUsers")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (!existingAppUser) {
        // Create entry in appUsers table only if it doesn't exist
        const appUserData: {
          id: string;
          name: string;
          email: string;
          role: string;
          profession: string;
          age: string;
          profileImage: string;
          favorites: any[];
          privacyPolicy: string;
          privacyPolicyDate?: string;
          created_at: string;
        } = {
          id: userId,
          name: listing.user_info.name,
          email: listing.user_info.email,
          role: "member",
          profession: listing.user_info.profession || "",
          age: listing.user_info.age || "",
          profileImage: listing.user_info.profile_image_url || "",
          favorites: [],
          privacyPolicy: listing.privacy_policy_accepted ? "accepted" : "",
          created_at: new Date().toISOString(),
        };

        // Only add privacyPolicyDate if it exists
        if (listing.privacy_policy_date) {
          appUserData.privacyPolicyDate = listing.privacy_policy_date;
        }

        const { error: appUserError } = await supabase
          .from("appUsers")
          .insert(appUserData);

        if (appUserError) {
          console.error("Error inserting into appUsers table:", appUserError);
          return NextResponse.json(
            {
              error: `Error inserting into appUsers table: ${appUserError.message}`,
            },
            { status: 500 }
          );
        }
      }

      // Check if listing already exists
      const { data: existingListing } = await supabase
        .from("listings")
        .select("id")
        .eq("id", listing.id)
        .maybeSingle();

      // Prepare listing data
      const listingData = {
        id: listing.id,
        status: "approved",
        user_id: userId,
        user_info_id: listing.user_info_id,
        home_info_id: listing.home_info_id,
        amenities_id: listing.amenities_id,
        highlight_tag: null,
        slug: listing.slug,
        global_order_rank: null,
        highlighted_order_rank: null,
        privacy_policy_accepted: listing.privacy_policy_accepted,
        privacy_policy_date: listing.privacy_policy_date,
        created_at: listing.created_at,
        is_highlighted: listing.is_highlighted,
      };

      let insertError;
      if (existingListing) {
        // Update existing listing
        const { error } = await supabase
          .from("listings")
          .update(listingData)
          .eq("id", listing.id);
        insertError = error;
      } else {
        // Insert new listing
        const { error } = await supabase.from("listings").insert(listingData);
        insertError = error;
      }

      if (insertError) {
        console.error("Error inserting/updating listings table:", insertError);
        return NextResponse.json(
          {
            error: `Error inserting/updating listings table: ${insertError.message}`,
          },
          { status: 500 }
        );
      }

      // Delete from needs_approval table
      const { error: deleteError } = await supabase
        .from("needs_approval")
        .delete()
        .eq("id", listingId);

      if (deleteError) throw deleteError;

      // Send emails and log action only if all previous operations succeeded
      try {
        // Send approval email first
        const approvalEmailResponse = await fetch(
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
        const emailPayload = JSON.stringify({
          email: listing.user_info.email,
          templateId: 1,
          params: { name: listing.user_info.name },
      });
  
      console.info("📩 Email payload before sending:", emailPayload);
      console.info("📏 Calculated Content-Length for email request:", Buffer.byteLength(emailPayload, "utf-8"));
  

        if (!approvalEmailResponse.ok) {
          throw new Error("Failed to send approval email");
        }
        const emailResponseData = await approvalEmailResponse.json();
        console.info("📧 Brevo response:", emailResponseData);
    
        // Send password reset email using Brevo template 3
        const resetUrl =
          process.env.NODE_ENV === "development"
            ? `http://localhost:3000/sign-up?email=${listing.user_info.email}`
            : `https://swom.travel/sign-up?email=${listing.user_info.email}`;

        const resetEmailResponse = await fetch(
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

        if (!resetEmailResponse.ok) {
          throw new Error("Failed to send password reset email");
        }

        // Log the approval action
        await logAdminAction(supabase, adminId, "approve_listing", {
          listing_id: listingId,
          listing_title: listing.home_info.title,
          user_email: listing.user_info.email,
          action_details: JSON.stringify({
            status: "approved",
            listing_id: listingId,
          }),
        });
      } catch (error) {
        console.error("Error in final steps:", error);
        // Don't throw the error as emails and logging are not critical for the approval process
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

      // Log the rejection action
      await logAdminAction(supabase, adminId, "reject_listing", {
        listing_id: listingId,
        listing_title: listing.home_info.title,
        user_email: listing.user_info.email,
      });
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
