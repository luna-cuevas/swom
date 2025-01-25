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
      const channelName = `messages:${conversationId}`;
      const existingChannel = supabase
        .getChannels()
        .find((ch) => ch.topic === channelName);
      if (existingChannel) {
        console.log("Channel already exists, skipping subscription");
        return () => { };
      }

      const channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: true },
          presence: { key: userId },
        },
      });

      channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages_new",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            if (payload.new) {
              queryClient.invalidateQueries({
                queryKey: ["messages", conversationId],
                exact: true,
              });

              if (payload.new.sender_id !== userId) {
                queryClient.invalidateQueries({
                  queryKey: ["conversations", userId],
                  exact: true,
                });
              }
            }
          }
        )
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          console.log("Presence state:", state);
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          console.log("Join:", key, newPresences);
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          console.log("Leave:", key, leftPresences);
        })
        .on("broadcast", { event: "typing" }, ({ payload }) => {
          if (payload.userId !== userId) {
            setTypingUsers((prev) => ({
              ...prev,
              [payload.userId]: {
                userId: payload.userId,
                isTyping: payload.isTyping,
                timestamp: Date.now(),
              },
            }));

            setTimeout(() => {
              setTypingUsers((prev) => {
                const { [payload.userId]: _, ...rest } = prev;
                return rest;
              });
            }, 3000);
          }
        });

      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Subscribed to messages in conversation ${conversationId}`);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          console.log(
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