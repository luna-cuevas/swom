"use client";

import { useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { FileAttachmentView } from "./FileAttachment";
import { FileAttachment, TypingStatus } from "../types";
import { useQueryClient } from "@tanstack/react-query";

interface Message {
  id: string;
  content: string;
  created_at: string;
  attachments?: FileAttachment[];
  sender: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  typingUsers: Record<string, TypingStatus>;
  conversationId: string;
}

export function MessageList({
  messages,
  currentUserId,
  conversationId,
  typingUsers,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const queryClient = useQueryClient();
  const unreadMessageRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, []);

  // Use useLayoutEffect to scroll before browser paint
  useLayoutEffect(() => {
    scrollToBottom();
  }, [conversationId, scrollToBottom]); // Scroll when conversation changes

  useLayoutEffect(() => {
    if (messages?.length) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]); // Scroll when messages change

  const markMessagesAsRead = useCallback(
    async (messageIds: string[]) => {
      if (!messageIds.length) return;

      try {
        const response = await fetch("/api/members/messages/mark-as-read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId,
            messageIds,
            userId: currentUserId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to mark messages as read");
        }

        // Invalidate all relevant queries to update UI
        queryClient.invalidateQueries({ queryKey: ["unreadCounts"] });
        queryClient.invalidateQueries({ queryKey: ["messages"] });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });

        // Force refetch the unread count
        queryClient.refetchQueries({
          queryKey: ["unreadCount"],
          type: "active",
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    },
    [conversationId, queryClient]
  );

  // Set up intersection observer
  useEffect(() => {
    if (!currentUserId) return;

    const options = {
      root: containerRef.current,
      threshold: 0.1, // Reduce threshold to 10% visibility
      rootMargin: "50px", // Add margin to start loading earlier
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const visibleMessageIds = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => entry.target.id)
        .filter((id) => {
          const message = messages.find((m) => m.id === id);
          return message && message.sender.id !== currentUserId;
        });

      if (visibleMessageIds.length > 0) {
        markMessagesAsRead(visibleMessageIds);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, options);

    // Observe all unread messages
    messages.forEach((message) => {
      if (message.sender.id !== currentUserId) {
        const element = unreadMessageRefs.current.get(message.id);
        if (element) {
          observerRef.current?.observe(element);
        }
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [messages, currentUserId, markMessagesAsRead]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto py-6 px-2 md:px-10">
      {messages.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">Start your conversation</p>
            <p className="text-sm">Send a message to begin chatting</p>
          </div>
        </div>
      ) : (
        <div>
          <ul className="flex flex-col gap-6">
            {messages.map((message) => {
              const isCurrentUser = message.sender.id === currentUserId;
              const isUnread = !isCurrentUser;

              return (
                <li
                  key={message.id}
                  id={message.id}
                  ref={(node) => {
                    if (node && isUnread) {
                      unreadMessageRefs.current.set(message.id, node);
                      observerRef.current?.observe(node);
                    } else {
                      unreadMessageRefs.current.delete(message.id);
                    }
                  }}
                  className={cn(
                    "flex opacity-0 transition-all justify-end duration-75 ease-in-out gap-4",
                    {
                      "ml-auto opacity-100": isCurrentUser,
                      "mr-auto opacity-100": !isCurrentUser,
                    }
                  )}>
                  <Avatar className="relative w-[30px] h-[30px] my-auto">
                    <AvatarImage src={message.sender.avatar_url} />
                    <AvatarFallback>
                      {message.sender.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "my-auto py-2 font-sans md:text-lg px-10 rounded-3xl",
                      {
                        "bg-[#dbd7d6]": isCurrentUser,
                        "bg-[#E5DEDB]": !isCurrentUser,
                      }
                    )}>
                    {message.content}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex flex-col gap-2 mt-2">
                        {message.attachments.map((attachment) => (
                          <FileAttachmentView
                            key={attachment.id}
                            attachment={attachment}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <div ref={messagesEndRef} />{" "}
          {/* Add an element at the end to scroll to */}
        </div>
      )}
    </div>
  );
}
