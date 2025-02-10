import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Host, ListingInfo } from "../types";

interface UseNewConversationProps {
  userId: string | undefined;
  userEmail: string | undefined;
  urlParams: {
    listingId: string | null;
    hostEmail: string | null;
  };
  setUrlParams: (params: { listingId: string | null; hostEmail: string | null }) => void;
  setSelectedConversationId: (id: string | null) => void;
  setShouldAutoSelectFirst: (value: boolean) => void;
  isHandlingUrlParams: boolean;
  setIsHandlingUrlParams: (value: boolean) => void;
}

/**
 * Custom hook to manage new conversation creation
 * Handles fetching host/listing info and creating new conversations
 */
export function useNewConversation({
  userId,
  userEmail,
  urlParams,
  setUrlParams,
  setSelectedConversationId,
  setShouldAutoSelectFirst,
  isHandlingUrlParams,
  setIsHandlingUrlParams,
}: UseNewConversationProps) {
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactingHost, setContactingHost] = useState<Host | null>(null);
  const [listingInfo, setListingInfo] = useState<ListingInfo | null>(null);
  const queryClient = useQueryClient();

  const clearUrlParams = () => {
    console.log("🧹 Clearing URL parameters");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("listingId");
      url.searchParams.delete("hostEmail");
      window.history.replaceState({}, "", url.toString());

      if (urlParams.listingId !== null || urlParams.hostEmail !== null) {
        setUrlParams({ listingId: null, hostEmail: null });
        setShouldAutoSelectFirst(true);
        setIsHandlingUrlParams(false);
      }
    }
  };

  const createNewConversation = async () => {
    if (!isHandlingUrlParams) return;

    if (!userId || !urlParams.listingId || !urlParams.hostEmail || isCreatingConversation) {
      console.log("❌ Cannot create conversation - missing data:", {
        userId,
        listingId: urlParams.listingId,
        hostEmail: urlParams.hostEmail,
        isCreating: isCreatingConversation,
      });
      return;
    }

    try {
      setIsCreatingConversation(true);
      setError(null);

      // Fetch host info
      console.log("📡 Fetching host info...");
      const hostResponse = await fetch(
        `/api/members/messages/get-host?email=${encodeURIComponent(urlParams.hostEmail)}`
      );
      const hostData = await hostResponse.json();
      console.log("📥 Received host info:", hostData);

      if (!hostResponse.ok || !hostData.host) {
        throw new Error("Failed to fetch host info");
      }

      const host = hostData.host;
      console.log("👤 Setting host info:", host);
      setContactingHost(host);

      // Fetch listing info
      console.log("📡 Fetching listing info...");
      const listingResponse = await fetch(
        `/api/members/messages/get-conversation-info`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId: urlParams.listingId }),
        }
      );
      const listingData = await listingResponse.json();
      console.log("📥 Received listing info:", listingData);

      if (listingData.listing) {
        console.log("🏠 Setting listing info:", listingData.listing);
        setListingInfo({
          id: listingData.listing.id,
          title: listingData.listing.title,
          image: listingData.listing.images[0] || "/placeholder.jpg",
          bathrooms: listingData.listing.bathrooms,
          bedrooms: listingData.listing.bedrooms,
          city: listingData.listing.city,
        });
      }

      // Create new conversation
      console.log("📝 Creating new conversation with data:", {
        participants: [userId, host.id],
        listingId: urlParams.listingId,
        hostEmail: urlParams.hostEmail,
        userEmail,
        host,
      });

      const response = await fetch("/api/members/messages/create-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants: [userId, host.id],
          listingId: urlParams.listingId,
          hostEmail: urlParams.hostEmail,
          userEmail,
          host,
        }),
      });

      const data = await response.json();
      console.log("📥 Create conversation response:", data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.conversation?.id) {
        console.log("✅ Successfully created conversation:", data.conversation);
        setSelectedConversationId(data.conversation.id);
        await queryClient.invalidateQueries({ queryKey: ["conversations", userId] });
        clearUrlParams();
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("❌ Error creating new conversation:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create conversation. Please try again."
      );
    } finally {
      setIsCreatingConversation(false);
      setIsHandlingUrlParams(false);
    }
  };

  useEffect(() => {
    createNewConversation();
  }, [userId, urlParams.listingId, urlParams.hostEmail, isHandlingUrlParams]);

  return {
    isCreatingConversation,
    isHandlingUrlParams,
    setIsHandlingUrlParams,
    error,
    contactingHost,
    listingInfo,
    setListingInfo,
    setContactingHost,
    clearUrlParams,
  };
} 