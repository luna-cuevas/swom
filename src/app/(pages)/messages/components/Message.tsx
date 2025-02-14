import { Message } from "../types";
import { FileAttachmentView } from "./FileAttachment";
import { ProposalMessage } from "./ProposalMessage";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";

interface MessageProps {
  message: Message;
  isOwnMessage: boolean;
  conversationId: string;
}

export function MessageView({ message, isOwnMessage, conversationId }: MessageProps) {
  // Parse content if it's a proposal message
  const renderMessageContent = () => {
    console.log('Message type:', message.type);
    if (message.type === 'PROPOSAL') {
      try {
        const proposalData = JSON.parse(message.content);
        return (
          <ProposalMessage 
            proposal={proposalData}
            messageId={message.id}
            isOwnMessage={isOwnMessage}
            conversationId={conversationId}
          />
        );
      } catch (error) {
        console.error('Error parsing proposal data:', error);
        return <p className="text-sm text-red-500">Error displaying proposal</p>;
      }
    }

    return (
      <div
        className={`rounded-lg p-3 ${
          isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}>
        {message.content && (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}
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
    );
  };

  return (
    <div
      className={`flex gap-3 ${
        isOwnMessage ? "flex-row-reverse" : "flex-row"
      }`}>
      <Avatar className="w-8 h-8">
        <AvatarImage
          src={message.sender.avatar_url}
          alt={message.sender.name}
        />
      </Avatar>
      <div
        className={`flex flex-col gap-2 max-w-[70%] ${
          isOwnMessage ? "items-end" : "items-start"
        }`}>
        {renderMessageContent()}
        <span className="text-xs text-muted-foreground">
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
