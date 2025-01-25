import { getSupabaseClient } from "./supabaseClient";

export default async function getUnreadConversations(userId: string) {
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

    const unreadConversations = conversations?.filter((conversation) => {
      const userParticipant = conversation.participants.find(
        (p: { user_id: string }) => p.user_id === userId
      );

      return (
        userParticipant &&
        conversation.last_message_at &&
        (!userParticipant.last_read_at ||
          new Date(conversation.last_message_at) >
            new Date(userParticipant.last_read_at))
      );
    });

    return unreadConversations || [];
  } catch (error) {
    console.error("Error getting unread conversations:", error);
    return [];
  }
}
