import { getSupabaseClient } from "./supabaseClient";

export default async function getUnreadMessageCount(
  userId: string
): Promise<number> {
  try {
    const supabase = getSupabaseClient();

    const { data: conversations, error } = await supabase
      .from("conversations_new")
      .select(
        `
        id,
        last_message_at,
        participants:conversation_participants(
          user_id,
          last_read_at
        )
      `
      )
      .contains("participants", [{ user_id: userId }]);

    if (error) {
      throw error;
    }

    const unreadCount = conversations?.reduce((count, conversation) => {
      const userParticipant = conversation.participants.find(
        (p: { user_id: string }) => p.user_id === userId
      );

      if (
        userParticipant &&
        conversation.last_message_at &&
        (!userParticipant.last_read_at ||
          new Date(conversation.last_message_at) >
            new Date(userParticipant.last_read_at))
      ) {
        return count + 1;
      }

      return count;
    }, 0);

    return unreadCount || 0;
  } catch (error) {
    console.error("Error getting unread message count:", error);
    return 0;
  }
}
