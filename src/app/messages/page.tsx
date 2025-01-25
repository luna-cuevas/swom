"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { globalStateAtom } from "@/context/atoms";
import { getSupabaseClient } from "@/utils/supabaseClient";
import { MessageList } from "./components/MessageList";
import { ConversationList } from "./components/ConversationList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Calendar, Menu, X, Home, CalendarDays } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";

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
      email: string;
    };
  }>;
}

interface ListingInfo {
  id: string;
  title: string;
  price: number;
  image: string;
}

interface Host {
  id: string;
  name: string;
  profileImage?: string;
  email: string;
}

export default function MessagesPage() {
  const [state] = useAtom(globalStateAtom);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [newMessage, setNewMessage] = useState("");
  const [mobileNavMenu, setMobileNavMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactingHost, setContactingHost] = useState<Host | null>(null);
  const [urlParams, setUrlParams] = useState<{
    listingId: string | null;
    hostEmail: string | null;
  }>({
    listingId: null,
    hostEmail: null,
  });
  const searchParams = useSearchParams();
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();
  const [listingInfo, setListingInfo] = useState<ListingInfo | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Initialize URL parameters safely
  useEffect(() => {
    if (searchParams) {
      setUrlParams({
        listingId: searchParams.get("listingId"),
        hostEmail: searchParams.get("hostEmail"),
      });
    }
  }, [searchParams]);

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery(
    {
      queryKey: ["conversations", state.user?.id],
      queryFn: async () => {
        if (!state.user?.id) return [];
        const response = await fetch(
          `/api/members/messages/get-conversations`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: state.user.email }),
          }
        );
        const data = await response.json();
        return data.conversations || [];
      },
      enabled: !!state.user?.id,
    }
  );

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId || !state.user?.id) return [];
      const response = await fetch(
        `/api/members/messages/get-messages?conversationId=${selectedConversationId}&userId=${state.user.id}`
      );
      const data = await response.json();
      return data.messages || [];
    },
    enabled: !!selectedConversationId && !!state.user?.id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      content,
      conversation_id,
      sender_id,
    }: {
      content: string;
      conversation_id: string;
      sender_id: string;
    }) => {
      const response = await fetch("/api/members/messages/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id,
          content,
          sender_id,
          listing_id: listingInfo?.id,
          user_email: state.user.email,
          host_email: contactingHost?.email,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", selectedConversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversations", state.user?.id],
      });
      setNewMessage("");
    },
  });

  useEffect(() => {
    // Only try to fetch host info if we have a selected conversation
    if (selectedConversationId) {
      // Clear contactingHost when selecting an existing conversation
      setContactingHost(null);
      subscribeToMessages(selectedConversationId);
      setMobileNavMenu(false);

      // Find the selected conversation and get the host's info
      const selectedConversation = conversationsData?.find(
        (conv: Conversation) => conv.id === selectedConversationId
      );

      if (selectedConversation) {
        // Fetch host info and listing info using the conversation ID
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
            console.log("fetching conversation info:", data);

            if (!response.ok) {
              throw new Error(
                data.error || "Failed to fetch conversation info"
              );
            }

            console.log("data host", data.host);

            if (data.host) {
              setContactingHost(data.host);
            }
            if (data.listing) {
              setListingInfo({
                id: data.listing.id,
                title: data.listing.title,
                price: data.listing.price_per_night,
                image: data.listing.images[0] || "/placeholder.jpg",
              });
            }
          } catch (error) {
            console.error("Error fetching conversation info:", error);
            setError("Failed to load conversation details");
          }
        };

        fetchConversationInfo();
      }
    }
  }, [selectedConversationId, conversationsData]);

  useEffect(() => {
    // When listingId and hostEmail are present in URL, create a new conversation
    if (state.user?.id && urlParams.listingId && urlParams.hostEmail) {
      console.log("Creating new conversation with:", {
        listingId: urlParams.listingId,
        hostEmail: decodeURIComponent(urlParams.hostEmail),
      });

      // Get host info from listing first
      const fetchListingInfo = async () => {
        try {
          const response = await fetch(
            `/api/members/messages/get-conversation-info`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                listingId: urlParams.listingId,
              }),
            }
          );
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to fetch listing info");
          }

          if (data.host && data.listing) {
            setContactingHost(data.host);
            setListingInfo({
              id: data.listing.id,
              title: data.listing.title,
              price: data.listing.price_per_night || 0,
              image: data.listing.images[0] || "/placeholder.jpg",
            });

            // Initialize conversation with the host info from listing
            await initializeConversation(data.host.id, data.listing.id);
          }
        } catch (error) {
          console.error("Error fetching listing info:", error);
          setError("Failed to load listing details");
        }
      };

      fetchListingInfo();
    }
  }, [state.user?.id, urlParams.listingId, urlParams.hostEmail]);

  const initializeConversation = async (hostId: string, listingId?: string) => {
    try {
      setError(null);

      const hostInfo = await fetch(
        `/api/members/messages/get-conversation-info`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingId: listingId,
          }),
        }
      );
      const hostData = await hostInfo.json();

      const response = await fetch(
        "/api/members/messages/create-conversation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participants: [state.user.id, hostId],
            listingId,
            hostEmail: hostData.host.email,
            userEmail: state.user.email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          response.status === 404
            ? "Unable to start conversation. The host may no longer be available."
            : data.error || "Failed to create conversation"
        );
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.conversation?.id) {
        setSelectedConversationId(data.conversation.id);
        queryClient.invalidateQueries({
          queryKey: ["conversations", state.user?.id],
        });

        // Clear URL parameters after successful conversation creation
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.delete("listingId");
          url.searchParams.delete("hostEmail");
          window.history.replaceState({}, "", url.toString());
          setUrlParams({ listingId: null, hostEmail: null });
        }
      } else {
        setError("Invalid response format from server");
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      setError("Failed to create conversation. Please try again.");
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId) return;

    sendMessageMutation.mutate({
      conversation_id: selectedConversationId,
      content: newMessage,
      sender_id: state.user.id,
    });
  };

  const subscribeToMessages = (conversationId: string) => {
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages_new",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          // Invalidate and refetch messages when a new message arrives
          queryClient.invalidateQueries({
            queryKey: ["messages", conversationId],
          });
          queryClient.invalidateQueries({
            queryKey: ["conversations", state.user?.id],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  if (conversationsLoading || isLoading) {
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
              {/* Mobile close button */}
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
                {/* Mobile toggle */}
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

                {/* Listing info and actions */}
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
                        <p className="text-sm text-gray-500">
                          ${listingInfo.price} per night
                        </p>
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
                            <div className="grid gap-2">
                              <Label>Total</Label>
                              <p className="text-2xl font-semibold text-gray-900">
                                ${listingInfo.price * 7}
                              </p>
                              <p className="text-sm text-gray-500">
                                for 7 nights
                              </p>
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
                      currentUserId={state.user.id}
                    />
                  </div>
                  <form
                    onSubmit={sendMessage}
                    className="sticky bottom-0 p-4 bg-white/50 backdrop-blur-sm border-t border-gray-200 flex gap-3">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="flex-1 rounded-full border-gray-300 focus:border-[#E88527] focus:ring-[#E88527] bg-white/80"
                    />
                    <Button
                      type="submit"
                      className="rounded-full bg-[#E88527] hover:bg-[#e88427ca] px-6">
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
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
