import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, X } from "lucide-react";
import { FileAttachment } from "../types";

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: FileAttachment[]) => void;
  conversationId: string;
  senderId: string;
  isLoading?: boolean;
  error?: string | null;
}

export function MessageInput({
  onSendMessage,
  conversationId,
  senderId,
  isLoading = false,
  error,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message, attachments);
      // Don't clear the message and attachments here
      // They will be cleared when the mutation succeeds
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files?.length) return;

    // Prevent upload if no valid conversation ID
    if (!conversationId) {
      console.error("No valid conversation ID");
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setIsUploading(true);
    try {
      const uploadedAttachments = await Promise.all(
        Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("conversationId", conversationId);
          formData.append("senderId", senderId);

          const response = await fetch("/api/members/messages/upload", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          if (!response.ok || data.error) {
            throw new Error(data.error || "Failed to upload file");
          }
          return data;
        })
      );

      setAttachments((prev) => [...prev, ...uploadedAttachments]);
    } catch (error) {
      console.error("Error uploading files:", error);
      // Reset attachments that failed to upload
      setAttachments([]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
  };

  return (
    <div className="p-4 border-t">
      {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
              <span className="text-sm truncate max-w-[200px]">
                {attachment.filename}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(attachment.id)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileSelect}
          accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !conversationId || isLoading}>
          <Paperclip className="w-5 h-5" />
        </Button>
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={isUploading || isLoading}
          className="relative">
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
