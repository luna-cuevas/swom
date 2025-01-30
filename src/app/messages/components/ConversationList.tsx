"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Conversation {
  id: string;
  last_message: string | null;
  last_message_at: string | null;
  participants: Array<{
    user_id: string;
    last_read_at: string | null;
    user: {
      id: string;
      name: string;
      profileImage?: string;
    };
  }>;
}

interface ConversationListProps {
  conversations: Conversation[] | undefined;
  currentUserId: string;
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  contactingHost: {
    id: string;
    name: string;
    profileImage?: string;
  } | null;
}

export function ConversationList({
  conversations = [],
  currentUserId,
  selectedConversationId,
  onSelectConversation,
  contactingHost,
}: ConversationListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
        <p className="text-sm text-gray-500">
          {conversations?.length || 0} Conversation
          {conversations?.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {(!conversations || conversations.length === 0) && !contactingHost ? (
          <div className="flex h-full items-center justify-center p-4 text-center text-gray-500">
            <p>No conversations yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {/* {contactingHost && (
              <li
                className={cn(
                  "p-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors cursor-pointer",
                  { "bg-white": true }
                )}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contactingHost.profileImage} />
                  <AvatarFallback className="bg-[#E88527] text-white">
                    {contactingHost.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {contactingHost.name}
                  </p>
                  <p className="text-sm text-gray-500">New conversation</p>
                </div>
              </li>
            )} */}

            {conversations?.map((conversation) => {
              const otherParticipant = conversation.participants?.find(
                (p) => p.user?.id !== currentUserId
              );

              if (!otherParticipant?.user) return null;

              console.log("📝 Conversation details:", {
                conversationId: conversation.id,
                type: typeof conversation.id,
                selectedId: selectedConversationId,
                selectedType: typeof selectedConversationId,
              });

              const isSelected = selectedConversationId === conversation.id;
              console.log("🎯 Conversation selection check:", {
                conversationId: conversation.id,
                selectedId: selectedConversationId,
                isSelected,
              });

              return (
                <li
                  key={conversation.id}
                  onClick={() => {
                    console.log("🖱️ Clicking conversation:", conversation.id);
                    onSelectConversation(conversation.id);
                  }}
                  className={`p-3 flex !border-t-0 items-center space-x-3 cursor-pointer border-l-4 transition-all duration-200 ${
                    isSelected
                      ? "bg-white !border-[#E88527] shadow-sm"
                      : "bg-transparent border-transparent hover:!border-[#E88527]/50"
                  }`}>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={otherParticipant.user.profileImage} />
                    <AvatarFallback className="bg-[#E88527] text-white">
                      {otherParticipant.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isSelected ? "text-[#E88527]" : "text-gray-900"
                      }`}>
                      {otherParticipant.user.name}
                    </p>
                    {conversation.last_message && (
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.last_message}
                      </p>
                    )}
                    {conversation.last_message_at && (
                      <p className="text-xs text-gray-400">
                        {format(
                          new Date(conversation.last_message_at),
                          "MMM d, h:mm a"
                        )}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
