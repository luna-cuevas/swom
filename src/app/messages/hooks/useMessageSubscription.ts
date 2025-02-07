import { useCallback, useRef, useState } from "react";
import { getSupabaseClient } from "@/utils/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";
import { TypingStatus } from "../types";

interface UseMessageSubscriptionProps {
  conversationId: string | null;
  userId: string | undefined;
  isHandlingUrlParams: boolean;
  isCreatingConversation: boolean;
}

/**
 * Custom hook to manage real-time message subscriptions and typing indicators
 * Handles Supabase channel subscriptions, presence, and typing status
 */
export function useMessageSubscription({
  conversationId,
  userId,
  isHandlingUrlParams,
  isCreatingConversation,
}: UseMessageSubscriptionProps) {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingStatus>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTypingUpdateRef = useRef<number>(0);

  // Subscribe to messages in a conversation
  const subscribeToMessages = useCallback(
    (conversationId: string) => {
      if (!conversationId || !userId) return () => { };

      // Prevent multiple subscriptions to the same channel
      const channelName = `message_status_room`;  // Use same channel as Navigation
      const existingChannel = supabase
        .getChannels()
        .find((ch) => ch.topic === channelName);
      if (existingChannel) {
        console.log("Channel already exists, skipping subscription");
        return () => { };
      }

      console.log("Setting up message subscription for conversation:", conversationId);

      const channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: true },
        },
      });

      channel
        .on(
          "broadcast",
          { event: "message_status" },
          async (payload) => {
            console.log("Received broadcast message:", payload);
            // Only process if we have a user and it's for this conversation
            if (
              payload.payload &&
              payload.payload.conversation_id === conversationId
            ) {
              console.log("Message is for current conversation, invalidating queries");
              // Invalidate queries to refresh the messages
              queryClient.invalidateQueries({
                queryKey: ["messages", conversationId],
                exact: true,
              });

              // If it's a new message and not from current user, also invalidate conversations
              if (
                payload.payload.action === "new_message" &&
                payload.payload.sender_id !== userId
              ) {
                queryClient.invalidateQueries({
                  queryKey: ["conversations", userId],
                  exact: true,
                });
              }
            }
          }
        )
        .on("broadcast", { event: "typing" }, (payload) => {
          console.log("Typing status change:", payload);
          if (payload.payload && payload.payload.userId !== userId) {
            setTypingUsers((prev) => ({
              ...prev,
              [payload.payload.userId]: {
                userId: payload.payload.userId,
                isTyping: payload.payload.isTyping,
                timestamp: Date.now(),
              },
            }));

            setTimeout(() => {
              setTypingUsers((prev) => {
                const { [payload.payload.userId]: _, ...rest } = prev;
                return rest;
              });
            }, 3000);
          }
        });

      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Subscribed to messages in conversation ${conversationId}`);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          console.error(
            `Channel ${status.toLowerCase()} for conversation ${conversationId}`
          );
        }
      });

      return () => {
        console.log(`Cleaning up subscription for ${conversationId}`);
        channel.unsubscribe();
      };
    },
    [userId, queryClient, supabase]
  );

  // Update typing status
  const updateTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (!conversationId || !userId) return;

      const now = Date.now();
      if (now - lastTypingUpdateRef.current < 1000) return;

      const channel = supabase.channel(`messages:${conversationId}`);
      channel.send({
        type: "broadcast",
        event: "typing",
        payload: {
          userId,
          isTyping,
        },
      });

      lastTypingUpdateRef.current = now;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          updateTypingStatus(false);
        }, 3000);
      }
    },
    [conversationId, userId, supabase]
  );

  return {
    typingUsers,
    updateTypingStatus,
    subscribeToMessages,
  };
} 