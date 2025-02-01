"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { globalStateAtom } from "@/context/atoms";
import { MessageList } from "./components/MessageList";
import { ConversationList } from "./components/ConversationList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Calendar, Menu, X, Home, CalendarDays } from "lucide-react";
import Image from "next/image";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { useConversations } from "./hooks/useConversations";
import { useMessages } from "./hooks/useMessages";
import { useMessageSubscription } from "./hooks/useMessageSubscription";
import { useNewConversation } from "./hooks/useNewConversation";
import { useUrlParams } from "./hooks/useUrlParams";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MessageInput } from "./components/MessageInput";
import { FileAttachment } from "./types";

/**
 * MessagesPage Component
 *
 * This component serves as the main messaging interface, allowing users to:
 * - View and select conversations
 * - Send and receive messages in real-time
 * - Create new conversations from listing pages
 * - View listing details and make reservations
 */
export default function MessagesPage() {
  const [state] = useAtom(globalStateAtom);
  const [mobileNavMenu, setMobileNavMenu] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize URL parameters and auto-selection behavior
  const {
    urlParams,
    setUrlParams,
    shouldAutoSelectFirst,
    setShouldAutoSelectFirst,
    isHandlingUrlParams,
    setIsHandlingUrlParams,
  } = useUrlParams();

  // Manage conversations and selection
  const {
    conversations: conversationsData,
    isLoading: conversationsLoading,
    selectedConversationId,
    setSelectedConversationId,
  } = useConversations({
    userId: state.user?.id,
    userEmail: state.user?.email,
    shouldAutoSelectFirst,
  });

  // Handle new conversation creation
  const {
    isCreatingConversation,
    error,
    contactingHost,
    listingInfo,
    setListingInfo,
    setContactingHost,
  } = useNewConversation({
    userId: state.user?.id,
    userEmail: state.user?.email,
    urlParams,
    setUrlParams,
    setSelectedConversationId,
    setShouldAutoSelectFirst,
    isHandlingUrlParams,
    setIsHandlingUrlParams,
  });

  // Manage messages and sending
  const {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    error: sendError,
    isLoading: isSending,
  } = useMessages({
    conversationId: selectedConversationId,
    userId: state.user?.id,
    listingInfo,
    contactingHostEmail: contactingHost?.email || null,
    userEmail: state.user?.email,
  });

  // Handle real-time message subscriptions
  const { typingUsers, updateTypingStatus, subscribeToMessages } =
    useMessageSubscription({
      conversationId: selectedConversationId,
      userId: state.user?.id,
      isHandlingUrlParams,
      isCreatingConversation,
    });

  // Set up message subscription for selected conversation
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (
      selectedConversationId &&
      !isHandlingUrlParams &&
      !isCreatingConversation
    ) {
      const selectedConversation = conversationsData?.find(
        (conv) => conv.id === selectedConversationId
      );

      if (selectedConversation) {
        const fetchConversationInfo = async () => {
          try {
            const response = await fetch(
              `/api/members/messages/get-conversation-info`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  listingId: selectedConversation.listing_id,
                }),
              }
            );
            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data.error || "Failed to fetch conversation info"
              );
            }

            if (data.host) {
              setContactingHost(data.host);
            }
            if (data.listing) {
              setListingInfo({
                id: data.listing.id,
                title: data.listing.title,
                image: data.listing.images[0] || "/placeholder.jpg",
                bathrooms: data.listing.bathrooms,
                bedrooms: data.listing.bedrooms,
                city: data.listing.city,
              });
            }
          } catch (error) {
            console.error("Error fetching conversation info:", error);
          }
        };

        fetchConversationInfo();
        cleanup = subscribeToMessages(selectedConversationId);
        setMobileNavMenu(false);
      }
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [
    selectedConversationId,
    conversationsData,
    isHandlingUrlParams,
    isCreatingConversation,
    subscribeToMessages,
  ]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (conversationsLoading || isLoading || isCreatingConversation) {
    return (
      <div
        role="status"
        className="flex m-auto h-full min-h-screen align-middle w-fit my-auto mx-auto px-3 py-2 text-white rounded-xl">
        <svg
          aria-hidden="true"
          className="m-auto w-[100px] h-[100px] text-gray-200 animate-spin dark:text-gray-600 fill-[#7F8119]"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="#fff"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <main className="relative flex w-screen min-h-screen bg-gradient-to-b from-[#F7F1EE] to-[#E5DEDB]">
        <div className="absolute w-full h-full opacity-30">
          <Image
            src="/messages/messages-bg.png"
            alt="messages"
            fill
            objectFit="cover"
          />
        </div>

        <div className="relative w-full max-w-7xl mx-auto my-8 rounded-2xl overflow-hidden shadow-2xl bg-white/80 backdrop-blur-sm">
          {error && (
            <div
              className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg z-50"
              role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="flex h-[85vh]">
            <div
              className={`${
                mobileNavMenu
                  ? "w-full md:w-[30%] absolute md:relative z-20"
                  : "w-0 md:w-[30%]"
              } h-full transition-all duration-200 ease-in-out bg-white/50 backdrop-blur-sm border-r border-gray-200`}>
              {mobileNavMenu && (
                <button
                  type="button"
                  onClick={() => setMobileNavMenu(false)}
                  className="md:hidden absolute right-4 top-4 p-2 rounded-lg hover:bg-gray-100 z-50">
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              )}
              <div className="h-full overflow-hidden">
                <ConversationList
                  conversations={conversationsData}
                  currentUserId={state.user.id}
                  selectedConversationId={selectedConversationId}
                  onSelectConversation={(id: string) => {
                    setSelectedConversationId(id);
                    setMobileNavMenu(false);
                  }}
                  contactingHost={contactingHost}
                />
              </div>
            </div>

            <div
              className={`flex-1 flex flex-col ${
                mobileNavMenu ? "hidden md:flex" : "flex"
              } bg-white/30`}>
              <div className="relative flex flex-col border-b border-gray-200">
                <div className="flex items-center justify-between p-4">
                  <h1 className="tracking-[0.3rem] font-bold uppercase text-2xl text-gray-800">
                    Messages
                  </h1>
                  <button
                    type="button"
                    onClick={() => setMobileNavMenu(!mobileNavMenu)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100">
                    <Menu className="h-6 w-6 text-gray-600" />
                  </button>
                </div>

                {selectedConversationId && listingInfo && (
                  <div className="flex flex-col md:flex-row items-start gap-4 p-4 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={listingInfo.image}
                          alt={listingInfo.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {listingInfo.title}
                        </h3>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-gray-500">
                            {listingInfo.bedrooms}{" "}
                            {listingInfo.bedrooms === 1
                              ? "bedroom"
                              : "bedrooms"}{" "}
                            • {listingInfo.bathrooms}{" "}
                            {listingInfo.bathrooms === 1
                              ? "bathroom"
                              : "bathrooms"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {listingInfo.city}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button
                        onClick={() =>
                          window.open(`/listings/${listingInfo.id}`, "_blank")
                        }
                        variant="outline"
                        className="flex-1 md:flex-none">
                        <Home className="h-4 w-4 mr-2" />
                        View Listing
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="flex-1 md:flex-none bg-[#E88527] hover:bg-[#e88427ca]">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Reserve
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Reserve Listing</DialogTitle>
                            <DialogDescription>
                              Select your dates and create a reservation
                              request.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label>Dates</Label>
                              <DatePickerWithRange
                                date={dateRange}
                                onDateChange={setDateRange}
                              />
                            </div>
                          </div>
                          <Button
                            className="w-full bg-[#E88527] hover:bg-[#e88427ca]"
                            onClick={() => {
                              console.log("Creating reservation...", {
                                listingId: listingInfo.id,
                                dates: dateRange,
                              });
                            }}>
                            Confirm Reservation
                          </Button>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
              </div>

              {selectedConversationId || contactingHost ? (
                <>
                  <div className="flex-1 overflow-y-auto">
                    <MessageList
                      messages={messages}
                      currentUserId={state.user?.id}
                      typingUsers={typingUsers}
                    />
                  </div>
                  <MessageInput
                    onSendMessage={sendMessage}
                    conversationId={selectedConversationId || ""}
                    senderId={state.user?.id || ""}
                    isLoading={isSending}
                    error={sendError}
                  />
                  {Object.values(typingUsers).length > 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500 italic">
                      {Object.values(typingUsers)
                        .map((user) => user.userId)
                        .join(", ")}{" "}
                      is typing...
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">
                      Welcome to Messages
                    </h3>
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="flex z-20 bg-[#17212D] flex-wrap md:flex-row py-5 tracking-widest justify-center text-xl gap-2 md:gap-5">
        <p className="!text-[#EBDECC]">LONDON</p>
        <p className="!text-[#EBDECC]">•</p>
        <p className="!text-[#EBDECC]">PARIS</p>
        <p className="!text-[#EBDECC]">•</p>
        <p className="!text-[#EBDECC]">NEW YORK</p>
        <p className="!text-[#EBDECC]">•</p>
        <p className="!text-[#EBDECC]">VIETNAM</p>
        <p className="!text-[#EBDECC]">•</p>
        <p className="!text-[#EBDECC]">COLOMBIA</p>
        <p className="!text-[#EBDECC]">•</p>
        <p className="!text-[#EBDECC]">SWITZERLAND</p>
      </div>
    </>
  );
}
