import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Message, ListingInfo } from "../types";

interface UseMessagesProps {
  conversationId: string | null;
  userId: string | undefined;
  listingInfo: ListingInfo | null;
  contactingHostEmail: string | null;
  userEmail: string | undefined;
}

/**
 * Custom hook to manage messages in a conversation
 * Handles fetching messages, sending new messages, and managing the message input state
 */
export function useMessages({
  conversationId,
  userId,
  listingInfo,
  contactingHostEmail,
  userEmail,
}: UseMessagesProps) {
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();

  // Fetch messages for the current conversation
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId || !userId) return [];
      const response = await fetch(
        `/api/members/messages/get-messages?conversationId=${conversationId}&userId=${userId}`
      );
      const data = await response.json();
      return data.messages || [];
    },
    enabled: !!conversationId && !!userId,
  });

  // Mutation for sending new messages
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      content,
      conversation_id,
      sender_id,
    }: {
      content: string;
      conversation_id: string;
      sender_id: string;
    }) => {
      const response = await fetch("/api/members/messages/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id,
          content,
          sender_id,
          listing_id: listingInfo?.id,
          user_email: userEmail,
          host_email: contactingHostEmail,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch messages and conversations
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversations", userId],
      });
      setNewMessage("");
    },
  });

  // Handler for sending messages
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !userId) return;

    sendMessageMutation.mutate({
      conversation_id: conversationId,
      content: newMessage,
      sender_id: userId,
    });
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
  };
} 