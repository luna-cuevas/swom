"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

              return (
                <li
                  key={message.id}
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
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
