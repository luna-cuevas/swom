import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { Conversation } from "../types";

interface UseConversationsProps {
  userId: string | undefined;
  userEmail: string | undefined;
  shouldAutoSelectFirst?: boolean;
}

/**
 * Custom hook to manage conversations
 * Handles fetching conversations and selecting the current conversation
 */
export function useConversations({ userId, userEmail, shouldAutoSelectFirst = true }: UseConversationsProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Fetch conversations for the current user
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/members/messages/get-conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await response.json();
      return data.conversations || [];
    },
    enabled: !!userId,
    staleTime: 0, // Disable automatic refetching
    refetchOnWindowFocus: false,
  });

  // Memoized setter to avoid recreating function
  const setSelectedId = useCallback((id: string | null) => {
    console.log("🎯 Setting selected conversation:", id);
    setSelectedConversationId(id);
  }, []);

  // Auto-select first conversation if enabled and no conversation is selected
  useEffect(() => {
    if (
      shouldAutoSelectFirst &&
      !selectedConversationId &&
      conversationsData &&
      conversationsData.length > 0
    ) {
      console.log("🔄 Auto-selecting first conversation:", conversationsData[0].id);
      setSelectedId(conversationsData[0].id);
    }
  }, [shouldAutoSelectFirst, selectedConversationId, conversationsData, setSelectedId]);

  return {
    conversations: conversationsData,
    isLoading: conversationsLoading,
    selectedConversationId,
    setSelectedConversationId: setSelectedId,
  };
} 