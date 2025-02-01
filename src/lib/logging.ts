import { SupabaseClient } from "@supabase/supabase-js";

export async function logAdminAction(
  supabase: SupabaseClient,
  adminId: string,
  action: string,
  details: any
) {
  try {
    const { error } = await supabase.from("admin_logs").insert({
      admin_id: adminId,
      action,
      details,
    });

    if (error) {
      console.error("Error logging admin action:", error);
    }
  } catch (error) {
    console.error("Error in logAdminAction:", error);
  }
}

export async function logMemberAction(
  supabase: SupabaseClient,
  userId: string,
  action: string,
  details: any
) {
  try {
    const { error } = await supabase.from("member_logs").insert({
      user_id: userId,
      action,
      details,
    });

    if (error) {
      console.error("Error logging member action:", error);
    }
  } catch (error) {
    console.error("Error in logMemberAction:", error);
  }
} 