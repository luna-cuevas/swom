import { getSupabaseClient } from "./supabaseClient";

export default async function getUnreadMessageCount(
  userId: string
): Promise<number> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("read_receipts")
      .select("conversation_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching unread messages:", error);
      throw error;
    }

    const unreadCount = data?.length || 0;


    return unreadCount;
  } catch (error) {
    console.error("Error getting unread message count:", error);
    return 0;
  }
}
